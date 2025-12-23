<!-- src/pages/Main/HospitalList/Comments/Comments.vue -->
<template>
  <section class="bg-gray-50 mx-4 p-3">
    <!-- 댓글 목록 -->
    <div class="mt-4 space-y-2">
      <div
        v-for="c in comments"
        :key="c.id ?? c.created_at"
        class="bg-white p-3"
      >
        <!-- 상단: 작성자 + 시간 + (수정/삭제) -->
        <div class="flex items-center justify-between gap-2">
          <p class="text-xs font-semibold text-gray-700">
            {{ maskEmail(c?.user?.email) }}
          </p>

          <div class="flex items-center gap-2">
            <span class="text-[11px] text-gray-400">
              {{ formatDate(c.created_at) }}
            </span>

            <!-- ✅ 본인 + 3일 이내만 수정 버튼 -->
            <button
              v-if="canEditComment(c)"
              type="button"
              class="rounded-lg border px-2 py-1 text-[11px] font-semibold text-gray-700 hover:bg-gray-50"
              @click.stop="startEdit(c)"
              :disabled="submitting"
            >
              수정
            </button>

            <!-- ✅ 본인만 삭제 버튼 -->
            <button
              v-if="isMine(c)"
              type="button"
              class="rounded-lg border px-2 py-1 text-[11px] font-semibold text-rose-600 hover:bg-rose-50"
              @click.stop="removeComment(c)"
              :disabled="submitting"
            >
              삭제
            </button>
          </div>
        </div>

        <!-- 본문 / 수정 모드 -->
        <div class="mt-2">
          <!-- ✅ 수정 모드 -->
          <div v-if="editingId === c.id" class="space-y-2">
            <textarea
              v-model="editContent"
              rows="2"
              class="w-full resize-none rounded-xl border bg-white px-3 py-2 text-sm
                     focus:ring-2 focus:ring-indigo-500"
              :disabled="submitting"
            />

            <div class="flex justify-end gap-2">
              <button
                type="button"
                class="rounded-xl border px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                @click="cancelEdit"
                :disabled="submitting"
              >
                취소
              </button>
              <button
                type="button"
                class="rounded-xl bg-indigo-600 px-3 py-2 text-sm font-semibold text-white
                       hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                @click="submitEdit(c)"
                :disabled="submitting || editContent.trim().length < 1"
              >
                저장
              </button>
            </div>

            <p v-if="editErrorMsg" class="text-xs text-rose-600">
              {{ editErrorMsg }}
            </p>
          </div>

          <!-- ✅ 일반 보기 -->
          <p
            v-else
            class="text-sm text-gray-800 whitespace-pre-line leading-relaxed"
          >
            {{ c.content }}
          </p>
        </div>
      </div>

      <hr class="my-4 border-gray-200" />
    </div>

    <!-- 작성 폼 -->
    <div class="mt-3 flex items-start gap-2">
      <textarea
        v-model="form.content"
        rows="2"
        class="w-full resize-none rounded-xl border bg-white px-3 py-2 text-sm
               focus:ring-2 focus:ring-indigo-500"
        placeholder="댓글을 입력하세요"
        :disabled="submitting"
      />
      <button
        type="button"
        class="shrink-0 rounded-xl bg-indigo-600 px-3 py-2 text-sm font-semibold text-white
               hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        @click="submitComment"
        :disabled="!canSubmit || submitting"
      >
        <span v-if="!submitting">등록</span>
        <span v-else>등록 중...</span>
      </button>
    </div>

    <p v-if="errorMsg" class="mt-2 text-xs text-rose-600">
      {{ errorMsg }}
    </p>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import api from '@/components/api'
import { useAuthStore } from '@/stores/auth'

/**
 * ✅ 스펙
 * - 수정/삭제: /hospitals/comments/detail/<int:comment_id>/
 *   - PUT: {"content":"수정된 댓글"}
 *   - DELETE
 * - 작성 후 3일 이내만 수정 가능
 */

const authStore = useAuthStore()

const props = defineProps({
  reviewId: { type: [Number, String], required: true },
})

const emit = defineEmits(['count'])

const comments = ref([])
const loading = ref(false)
const submitting = ref(false)
const errorMsg = ref('')

const form = ref({ content: '' })
const canSubmit = computed(() => form.value.content.trim().length >= 1)

const editingId = ref(null)
const editContent = ref('')
const editErrorMsg = ref('')

const formatDate = (iso) => {
  try {
    return new Date(iso).toLocaleString()
  } catch {
    return iso
  }
}

const maskEmail = (email) => {
  if (!email || !String(email).includes('@')) return '탈퇴한 회원입니다.'
  const [id, domain] = String(email).split('@')
  const visible = id.slice(0, 1) || 'x'
  return `${visible}****@${domain}`
}

// ✅ "본인 댓글" 판별: user.id 우선, 없으면 email로 fallback
const isMine = (c) => {
  const me = authStore.user
  if (!me) return false
  if (me.id && c?.user?.id) return String(me.id) === String(c.user.id)
  if (me.email && c?.user?.email) return String(me.email) === String(c.user.email)
  return false
}

// ✅ 3일 이내 수정 가능
const within3Days = (createdAt) => {
  try {
    const created = new Date(createdAt).getTime()
    if (Number.isNaN(created)) return false
    const now = Date.now()
    const diffMs = now - created
    return diffMs <= 3 * 24 * 60 * 60 * 1000
  } catch {
    return false
  }
}

const canEditComment = (c) => isMine(c) && within3Days(c?.created_at)

// ✅ 댓글 목록 조회
const fetchComments = async () => {
  if (!props.reviewId) return
  errorMsg.value = ''
  loading.value = true

  try {
    const { data } = await api.get(`/hospitals/comments/${props.reviewId}/`)
    comments.value = Array.isArray(data) ? data : (data?.results ?? [])
    emit('count', { reviewId: props.reviewId, count: comments.value.length })
  } catch (e) {
    console.error(e)
    errorMsg.value = '댓글을 불러오지 못했습니다.'
  } finally {
    loading.value = false
  }
}

// ✅ 댓글 등록
const submitComment = async () => {
  if (!props.reviewId || !canSubmit.value) return
  errorMsg.value = ''
  submitting.value = true

  try {
    await api.post(`/hospitals/comments/${props.reviewId}/`, {
      content: form.value.content.trim(),
    })
    form.value.content = ''
    await fetchComments()
  } catch (e) {
    console.error(e)
    errorMsg.value = '댓글 등록에 실패했습니다.'
  } finally {
    submitting.value = false
  }
}

// ===== 수정 흐름 =====
const startEdit = (c) => {
  if (!canEditComment(c)) return
  editingId.value = c.id
  editContent.value = c.content || ''
  editErrorMsg.value = ''
}

const cancelEdit = () => {
  editingId.value = null
  editContent.value = ''
  editErrorMsg.value = ''
}

const submitEdit = async (c) => {
  if (!c?.id) return
  if (!canEditComment(c)) {
    editErrorMsg.value = '수정 권한이 없거나, 작성 후 3일이 지났습니다.'
    return
  }

  const content = editContent.value.trim()
  if (content.length < 1) return

  submitting.value = true
  editErrorMsg.value = ''

  try {
    await api.put(`/hospitals/comments/detail/${c.id}/`, { content })

    // ✅ 로컬 반영(즉시) + 목록 재조회(선택)
    const idx = comments.value.findIndex((x) => String(x?.id) === String(c.id))
    if (idx !== -1) comments.value[idx] = { ...comments.value[idx], content }

    cancelEdit()
    // 서버가 updated_at 등을 주면 아래로 최신화
    await fetchComments()
  } catch (e) {
    console.error(e)
    // 403/400 등 서버 메시지 있으면 보여주기
    editErrorMsg.value =
      e?.response?.data?.detail ||
      e?.response?.data?.message ||
      '댓글 수정에 실패했습니다.'
  } finally {
    submitting.value = false
  }
}

// ===== 삭제 흐름 =====
const removeComment = async (c) => {
  if (!c?.id) return
  if (!isMine(c)) {
    alert('본인 댓글만 삭제할 수 있습니다.')
    return
  }

  const ok = confirm('댓글을 삭제할까요?')
  if (!ok) return

  submitting.value = true
  try {
    await api.delete(`/hospitals/comments/detail/${c.id}/`)

    // ✅ 로컬 제거 + 카운트 반영
    comments.value = comments.value.filter((x) => String(x?.id) !== String(c.id))
    emit('count', { reviewId: props.reviewId, count: comments.value.length })

    // (선택) 서버 기준으로 다시 맞추고 싶으면:
    // await fetchComments()
  } catch (e) {
    console.error(e)
    alert(
      e?.response?.data?.detail ||
      e?.response?.data?.message ||
      '댓글 삭제에 실패했습니다.'
    )
  } finally {
    submitting.value = false
  }
}

onMounted(fetchComments)
</script>

<style scoped>
</style>

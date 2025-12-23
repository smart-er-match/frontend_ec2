<!-- src/pages/Main/HospitalList/Review/ReviewList.vue -->
<template>
  <div class="mt-4 space-y-3">
    <div v-if="reviews.length === 0" class="bg-white p-4 text-gray-600">
      아직 리뷰가 없습니다.
    </div>

    <hr class="my-4 border-gray-200" />

    <article
      v-for="r in reviews"
      :key="r.id ?? r.created_at"
      class="space-y-2"
    >
      <!-- ✅ 카드 (클릭 없음) -->
      <div class="flex items-start justify-between gap-3 bg-white p-4 hover:bg-gray-50 transition">
        <div class="min-w-0 flex-1">
          <div class="flex items-start justify-between gap-3">
            <p class="text-sm font-bold text-gray-900">
              {{ maskEmail(r?.user?.email) }}
              <span class="ml-2 text-xs font-semibold text-gray-500">
                · {{ formatDate(r.created_at) }}
              </span>
            </p>

            <!-- ✅ 수정/삭제 -->
            <div v-if="canEdit(r)" class="shrink-0 flex items-center gap-2">
              <button
                type="button"
                class="rounded-lg border px-2.5 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                @click.stop="startEdit(r)"
                :disabled="busyId === r.id"
              >
                수정
              </button>
              <button
                type="button"
                class="rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-50"
                @click.stop="confirmDelete(r)"
                :disabled="busyId === r.id"
              >
                삭제
              </button>
            </div>
          </div>

          <!-- ✅ 수정 모드 -->
          <div v-if="editingId === r.id" class="mt-3 space-y-3" @click.stop>
            <!-- ⭐ 별점 수정 -->
            <div class="flex items-center gap-1">
              <button
                v-for="n in 5"
                :key="n"
                type="button"
                class="p-1 transition focus:outline-none focus:ring-0"
                :class="editForm.rating >= n ? 'text-amber-500' : 'text-gray-300'"
                @click.stop="editForm.rating = n"
              >
                <svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path
                    d="M12 17.27l-5.18 3.04 1.4-5.97-4.64-4.02
                      6.1-.52L12 4.5l2.32 5.3 6.1.52-4.64 4.02
                      1.4 5.97L12 17.27z"
                  />
                </svg>
              </button>
              <span class="ml-2 text-xs font-semibold text-gray-600">
                {{ editForm.rating }} / 5
              </span>
            </div>

            <!-- ✏️ 내용 수정 -->
            <textarea
              v-model="editForm.content"
              rows="3"
              class="w-full resize-none rounded-xl border bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
              placeholder="수정할 내용을 입력하세요"
              @click.stop
            />

            <!-- 버튼 -->
            <div class="flex items-center justify-end gap-2">
              <button
                type="button"
                class="rounded-xl border px-3 py-2 text-sm font-semibold hover:bg-gray-50"
                @click.stop="cancelEdit"
                :disabled="busyId === r.id"
              >
                취소
              </button>
              <button
                type="button"
                class="rounded-xl bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                @click.stop="saveEdit(r)"
                :disabled="busyId === r.id || !canSaveEdit"
              >
                <span v-if="busyId !== r.id">저장</span>
                <span v-else>저장 중...</span>
              </button>
            </div>

            <p v-if="rowError[r.id]" class="text-sm text-rose-600">
              {{ rowError[r.id] }}
            </p>
          </div>

          <!-- ✅ 보기 모드 -->
          <p v-else class="mt-2 text-sm text-gray-800 whitespace-pre-line">
            {{ r.content }}
          </p>

          <!-- ✅ 답글 버튼 -->
          <div class="mt-3 flex items-center justify-between">
            <button
              type="button"
              class="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
              @click="toggleComments(r.id)"
            >
              <svg
                class="h-4 w-4 transition-transform"
                :class="openReviewId === r.id ? 'rotate-180' : ''"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>

              {{ openReviewId === r.id ? '답글 접기' : '답글' }}

              <span class="ml-1 text-gray-400">
                ({{ commentCounts[String(r.id)] ?? 0 }})
              </span>
            </button>
          </div>
        </div>

        <!-- 우측 별점(보기 모드) -->
        <div v-if="editingId !== r.id" class="shrink-0 text-right">
          <div class="flex items-center justify-end gap-0.5">
            <svg
              v-for="n in 5"
              :key="n"
              viewBox="0 0 24 24"
              class="h-4 w-4"
              :class="n <= Number(r.rating || 0) ? 'text-amber-400' : 'text-gray-300'"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                d="M12 17.27l5.18 3.05-1.64-5.81L20 10.24l-5.91-.5
                   L12 4.5 9.91 9.74 4 10.24l4.46 4.27-1.64 5.81z"
              />
            </svg>
          </div>
        </div>
      </div>

      <!-- ✅ 답글 영역 -->
      <div v-if="openReviewId === r.id">
        <Comments :review-id="r.id" @count="onCommentCount" />
      </div>

      <hr class="my-4 border-gray-200" />
    </article>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import api from '@/components/api'
import Comments from '../Comments/Comments.vue'

const props = defineProps({
  reviews: { type: Array, default: () => [] },
  myUserId: { type: String, default: '' },
})

const emit = defineEmits(['updated', 'deleted'])

/** ✅ 댓글 수 캐시 */
const commentCounts = reactive({})

/** ✅ Comments.vue에서 받은 count로 덮어쓰기 */
const onCommentCount = ({ reviewId, count }) => {
  commentCounts[String(reviewId)] = Number(count) || 0
}

/** ✅ (클릭 없이) 초기 댓글 수 미리 채우기 */
const fetchCommentCount = async (reviewId) => {
  try {
    const { data } = await api.get(`/hospitals/comments/${reviewId}/`)
    const list = Array.isArray(data) ? data : (data?.results ?? [])
    commentCounts[String(reviewId)] = list.length
  } catch (e) {
    commentCounts[String(reviewId)] = 0
  }
}

const warmupCommentCounts = async () => {
  const ids = (props.reviews ?? [])
    .map((r) => r?.id)
    .filter(Boolean)

  const targets = ids.filter((id) => commentCounts[String(id)] == null)
  if (!targets.length) return

  await Promise.allSettled(targets.map((id) => fetchCommentCount(id)))
}

/** ✅ 리뷰 목록이 바뀌면 댓글 수도 미리 조회 */
watch(
  () => props.reviews,
  () => warmupCommentCounts(),
  { immediate: true, deep: true }
)

/** ====== 기존 리뷰 수정/삭제 로직 ====== */
const editingId = ref(null)
const busyId = ref(null)
const rowError = reactive({})

const editForm = reactive({
  content: '',
  rating: 5,
})

const canSaveEdit = computed(() => editForm.content.trim().length >= 1 && editForm.rating >= 1)

const formatDate = (iso) => {
  try { return new Date(iso).toLocaleString() } catch { return iso }
}

const maskEmail = (email) => {
  if (!email || !String(email).includes('@')) return '탈퇴한 회원입니다.'
  const [id, domain] = String(email).split('@')
  const visible = id.slice(0, 1) || 'x'
  return `${visible}****@${domain}`
}

const within3Days = (createdAt) => {
  try {
    const created = new Date(createdAt).getTime()
    const diffMs = Date.now() - created
    const threeDaysMs = 3 * 24 * 60 * 60 * 1000
    return diffMs <= threeDaysMs
  } catch {
    return false
  }
}

const isMine = (r) => {
  if (!props.myUserId) return false
  return String(r?.user?.id ?? '') === String(props.myUserId)
}

const canEdit = (r) => isMine(r) && within3Days(r?.created_at)

const startEdit = (r) => {
  editingId.value = r.id
  editForm.content = String(r?.content ?? '')
  editForm.rating = Number(r?.rating ?? 5)
  rowError[r.id] = ''
}

const cancelEdit = () => { editingId.value = null }

const saveEdit = async (r) => {
  if (!r?.id) return
  rowError[r.id] = ''
  busyId.value = r.id

  try {
    await api.put(`/hospitals/reviews/detail/${r.id}/`, {
      content: editForm.content.trim(),
      rating: Number(editForm.rating),
    })
    editingId.value = null
    emit('updated')
  } catch (e) {
    console.error(e)
    rowError[r.id] = '수정에 실패했습니다. (작성 후 3일 이내만 수정 가능)'
  } finally {
    busyId.value = null
  }
}

const confirmDelete = async (r) => {
  if (!r?.id) return
  rowError[r.id] = ''

  const ok = window.confirm('이 리뷰를 삭제할까요?')
  if (!ok) return

  busyId.value = r.id
  try {
    await api.delete(`/hospitals/reviews/detail/${r.id}/`)
    emit('deleted', r.id)
  } catch (e) {
    console.error(e)
    rowError[r.id] = '삭제에 실패했습니다. (작성 후 3일 이내만 삭제 가능)'
  } finally {
    busyId.value = null
  }
}

const openReviewId = ref(null)

const toggleComments = (reviewId) => {
  openReviewId.value = (openReviewId.value === reviewId) ? null : reviewId
}
</script>

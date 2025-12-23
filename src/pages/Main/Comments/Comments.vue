<!-- src/pages/Main/HospitalList/Comments/Comments.vue -->
<template>
  <section class="bg-gray-50 mx-4 p-3">
    <!-- 헤더 -->
        <!-- 댓글 목록 -->
    <div class="mt-4 space-y-2">
      <!-- <div v-if="comments.length === 0" class="rounded-xl border bg-white p-3 text-sm text-gray-600">
        아직 댓글이 없습니다.
      </div> -->

      <div
        v-for="c in comments"
        :key="c.id ?? c.created_at"
        class="bg-white p-3"
      >
        <!-- 상단: 작성자 + 시간 -->
        <div class="flex items-center justify-between gap-2">
          <p class="text-xs font-semibold text-gray-700">
            {{ maskEmail(c.user.email) }}
          </p>

          <span class="text-[11px] text-gray-400">
            {{ formatDate(c.created_at) }}
          </span>
        </div>

        <!-- 본문 -->
        <p class="mt-2 text-sm text-gray-800 whitespace-pre-line leading-relaxed">
          {{ c.content }}
        </p>
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
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import api from '@/components/api'

const props = defineProps({
  reviewId: { type: [Number, String], required: true },
})

const emit = defineEmits(['count'])
const comments = ref([])
const loading = ref(false)
const submitting = ref(false)
const errorMsg = ref('')

const form = ref({
  content: '',
})

const canSubmit = computed(() => form.value.content.trim().length >= 1)

const formatDate = (iso) => {
  try {
    return new Date(iso).toLocaleString()
  } catch {
    return iso
  }
}


// ✅ 댓글 목록 조회 (백엔드에 GET 없으면 이 함수/호출부 삭제해도 됨)
const fetchComments = async () => {
  if (!props.reviewId) return
  errorMsg.value = ''
  loading.value = true

  try {
    const { data } = await api.get(`/hospitals/comments/${props.reviewId}/`)
    // data가 배열이라고 가정. 만약 {results: []} 형태면 아래 한 줄만 바꿔줘:
    // comments.value = data.results ?? []
    comments.value = Array.isArray(data) ? data : (data?.results ?? [])
    emit('count', { reviewId: props.reviewId, count: comments.value.length })

  } catch (e) {
    console.error(e)
    errorMsg.value = '댓글을 불러오지 못했습니다.'
  } finally {
    loading.value = false
  }
}

const submitComment = async () => {
  if (!props.reviewId || !canSubmit.value) return
  errorMsg.value = ''
  submitting.value = true


  try {
    await api.post(`/hospitals/comments/${props.reviewId}/`, {
      content: form.value.content.trim(),
    })

    form.value.content = ''
    await fetchComments() // ✅ 등록 후 목록 갱신 (GET이 없으면 이 줄 지우고, 로컬 push로 처리)
  } catch (e) {
    console.error(e)
    errorMsg.value = '댓글 등록에 실패했습니다.'
  } finally {
    submitting.value = false
  }
}

const maskEmail = (email) => {
  if (!email || !String(email).includes('@')) return '익명'
  const [id, domain] = String(email).split('@')
  const visible = id.slice(0, 1) || 'x'
  return `${visible}****@${domain}`
}


// 필요하면 마운트 시 자동 로드 (원하면 켜)
onMounted(fetchComments)


</script>

<style scoped>
</style>

<template>
  <div class="mt-4 space-y-3">
    <div
      v-if="reviews.length === 0"
      class="rounded-2xl border bg-white p-4 text-gray-600"
    >
      아직 리뷰가 없습니다.
    </div>

    <article
      v-for="r in reviews"
      :key="r.id ?? r.created_at"
      class="rounded-2xl border bg-white p-4"
    >
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <p class="text-sm font-bold text-gray-900">
            {{ maskEmail(r?.user?.email) }}
            <span class="ml-2 text-xs font-semibold text-gray-500">
              · {{ formatDate(r.created_at) }}
            </span>
          </p>

          <p class="mt-2 text-sm text-gray-800 whitespace-pre-line">
            {{ r.content }}
          </p>
        </div>

        <div class="shrink-0 text-right">
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
                d="M12 17.27l5.18 3.05-1.64-5.81L20 10.24l-5.91-.5L12 4.5 9.91 9.74 4 10.24l4.46 4.27-1.64 5.81z"
              />
            </svg>
          </div>
        </div>
      </div>
    </article>
  </div>
</template>

<script setup>
const props = defineProps({
  reviews: { type: Array, default: () => [] },
})

const formatDate = (iso) => {
  try {
    return new Date(iso).toLocaleString()
  } catch {
    return iso
  }
}

const maskEmail = (email) => {
  if (!email || !String(email).includes('@')) return '익명'

  const [id, domain] = String(email).split('@')
  const visible = id.slice(0, 1) || 'x'
  return `${visible}****@${domain}`
}
</script>

<template>
  <svg
    v-if="icon === 'repair'"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="w-8 h-8 text-khaki-mid group-hover:text-neon-lemon transition-colors"
  >
    <path d="m15 5 4 4" />
    <path d="M21.5 12H16c-.5 0-.9-.2-1.2-.6l-1.4-1.8c-.3-.4-.7-.6-1.2-.6H2.5" />
    <path d="M12 2v20" />
    <path d="M17 12v5a2 2 0 0 1-2 2H9" />
    <path d="M5 12v5a2 2 0 0 0 2 2h2" />
  </svg>

  <svg
    v-else-if="icon === 'transport'"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="w-8 h-8 text-khaki-mid group-hover:text-neon-lemon transition-colors"
  >
    <path d="M14 18H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h8" />
    <path d="M14 9h5l3 3v4a2 2 0 0 1-2 2h-6" />
    <circle cx="7.5" cy="18.5" r="2.5" />
    <circle cx="16.5" cy="18.5" r="2.5" />
  </svg>

  <svg
    v-else-if="icon === 'autoservice'"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="w-8 h-8 text-khaki-mid group-hover:text-neon-lemon transition-colors"
  >
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>

  <svg
    v-else-if="icon === 'it'"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="w-8 h-8 text-khaki-mid group-hover:text-neon-lemon transition-colors"
  >
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
    <path d="m10 8-2 2 2 2" />
    <path d="m14 8 2 2-2 2" />
  </svg>

  <svg
    v-else-if="icon === 'business'"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="w-8 h-8 text-khaki-mid group-hover:text-neon-lemon transition-colors"
  >
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>

  <svg
    v-else-if="icon === 'tech'"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="w-8 h-8 text-khaki-mid group-hover:text-neon-lemon transition-colors"
  >
    <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
    <line x1="12" y1="18" x2="12.01" y2="18" />
  </svg>

  <svg
    v-else-if="icon === 'education'"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="w-8 h-8 text-khaki-mid group-hover:text-neon-lemon transition-colors"
  >
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
  </svg>
</template>

<script setup lang="ts">
defineProps<{
  icon: string
}>()
</script>

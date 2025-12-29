<script setup lang="ts">
const props = defineProps({
  year: {
    type: [String, Number],
    default: () => new Date().getFullYear()
  },
  size: {
    type: [String, Number],
    default: 500
  }
})

const colors = {
  surface: '#0d1117',
  surfaceDeep: '#161b22',
  ring: '#238636',
  ringSoft: '#58a6ff',
  border: '#30363d',
  text: '#c9d1d9',
  textMuted: '#8b949e'
}
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 360 420"
    xmlns="http://www.w3.org/2000/svg"
    class="github-year-icon"
  >
    <defs>
      <radialGradient id="badge-core" cx="50%" cy="40%" r="70%">
        <stop offset="0%" :stop-color="colors.surfaceDeep" />
        <stop offset="100%" :stop-color="colors.surface" />
      </radialGradient>

      <linearGradient id="badge-ring" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" :stop-color="colors.ringSoft" />
        <stop offset="100%" :stop-color="colors.ring" />
      </linearGradient>

      <clipPath id="badge-avatar-clip" clipPathUnits="userSpaceOnUse">
        <circle cx="0" cy="0" r="78" />
      </clipPath>
    </defs>

    <g transform="translate(180, 165)">
      <circle r="118" fill="url(#badge-core)" :stroke="colors.border" stroke-width="2" />
      <circle r="118" fill="none" stroke="url(#badge-ring)" stroke-width="8" opacity="0.9" />
      <circle r="92" fill="none" :stroke="colors.ring" stroke-width="2" stroke-opacity="0.25" stroke-dasharray="8 10" />

      <g clip-path="url(#badge-avatar-clip)">
        <image href="/github.png" x="-78" y="-78" width="156" height="156" preserveAspectRatio="xMidYMid slice" />
      </g>
      <circle r="78" fill="none" :stroke="colors.ringSoft" stroke-width="2" stroke-opacity="0.5" />
    </g>

    <text
      x="180"
      y="345"
      text-anchor="middle"
      font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif"
      font-weight="800"
      font-size="44"
      :fill="colors.text"
    >
      {{ year }}
    </text>
    <text
      x="180"
      y="378"
      text-anchor="middle"
      font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif"
      font-weight="600"
      font-size="22"
      :fill="colors.textMuted"
      letter-spacing="1"
    >
      Annual Review
    </text>
  </svg>
</template>

<style scoped>
.github-year-icon {
  user-select: none;
}
</style>

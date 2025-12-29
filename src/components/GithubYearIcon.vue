<script setup lang="ts">
import { computed } from 'vue'

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
  primary: '#39d353',
  secondary: '#c757e4',
  textDark: '#0a0c10',
  textLight: '#ffffff'
}
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 500 500"
    xmlns="http://www.w3.org/2000/svg"
    class="github-year-icon"
  >
    <defs>
      <filter id="intense-neon-glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur2" />
        <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur4" />
        <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur8" />
        <feGaussianBlur in="SourceGraphic" stdDeviation="15" result="blur15" />
        <feColorMatrix type="matrix" in="blur15" result="coloredBlur"
          values="0 0 0 0 0.22
                  0 0 0 0 0.83
                  0 0 0 0 0.32
                  0 0 0 1 0" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="blur8" />
          <feMergeNode in="blur4" />
          <feMergeNode in="blur2" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      <filter id="purple-glow">
        <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
        <feColorMatrix type="matrix" in="blur" result="purpleBlur"
          values="0 0 0 0 0.7
                  0 0 0 0 0.0
                  0 0 0 0 1.0
                  0 0 0 0.8 0" />
        <feMerge>
          <feMergeNode in="purpleBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>

      <radialGradient id="space-swirl" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
        <stop offset="0%" stop-color="#1a1f35" />
        <stop offset="40%" stop-color="#2a1a3a" />
        <stop offset="70%" stop-color="#0d1117" />
        <stop offset="100%" stop-color="#05070a" />
      </radialGradient>

      <linearGradient id="swirl-path-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" :stop-color="colors.primary" stop-opacity="0.0" />
        <stop offset="50%" stop-color="#8c52ff" stop-opacity="0.3" />
        <stop offset="100%" :stop-color="colors.primary" stop-opacity="0.0" />
      </linearGradient>

      <linearGradient id="star-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#7ee787" />
        <stop offset="100%" :stop-color="colors.primary" />
      </linearGradient>
    </defs>

    <g transform="translate(250, 230)">
      <circle r="130" fill="url(#space-swirl)" :stroke="colors.primary" stroke-width="1" stroke-opacity="0.3" />

      <g opacity="0.7" style="mix-blend-mode: lighten;">
        <path d="M-100,50 Q-50,-100 50,-80 T100,0" fill="none" stroke="url(#swirl-path-grad)" stroke-width="15" filter="url(#purple-glow)"/>
        <path d="M80,80 Q0,120 -80,40 T-50,-80" fill="none" stroke="url(#swirl-path-grad)" stroke-width="10" transform="rotate(90)" filter="url(#purple-glow)"/>
      </g>

      <g fill="#7ee787" opacity="0.6">
        <circle cx="-80" cy="-40" r="1.5" /><circle cx="60" cy="-70" r="2" /><circle cx="90" cy="20" r="1" />
        <circle cx="-30" cy="80" r="1.5" /><circle cx="20" cy="60" r="2" />
      </g>

      <circle r="135" fill="none" :stroke="colors.primary" stroke-width="2" opacity="0.3" />
      <g filter="url(#intense-neon-glow)" :stroke="colors.primary" stroke-width="3" fill="none" stroke-linecap="round">
        <circle r="135" stroke-dasharray="40 20 80 30 50 15" transform="rotate(-45)"/>
      </g>

      <g transform="translate(0, 10)">
        <g :fill="colors.primary" filter="url(#intense-neon-glow)">
          <rect x="-60" y="60" width="16" height="25" rx="3" opacity="0.7"/>
          <rect x="-35" y="45" width="16" height="40" rx="3" opacity="0.8"/>
          <rect x="-10" y="30" width="16" height="55" rx="3" opacity="0.9"/>
          <rect x="15" y="10" width="16" height="75" rx="3" />
        </g>

        <g filter="url(#purple-glow)">
          <polyline points="-70,60 -20,10 30,30 80,-30" fill="none" :stroke="colors.secondary" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
          <polygon points="80,-30 65,-20 70,-40" :fill="colors.secondary" transform="rotate(15, 80, -30)"/>
        </g>

        <g transform="translate(0, -100)">
          <path d="M0 -45 L 12 -15 L 42 -11 L 20 10 L 27 40 L 0 25 L -27 40 L -20 10 L -42 -11 L -12 -15 Z" fill="url(#star-gradient)" stroke="#aff5b4" stroke-width="2" filter="url(#intense-neon-glow)"/>

          <text x="0" y="10"
            font-family="'Inter', sans-serif"
            font-weight="900"
            font-size="22"
            :fill="colors.textDark"
            text-anchor="middle"
            style="pointer-events: none;"
          >{{ year }}</text>
        </g>
      </g>
    </g>

    <g transform="translate(250, 430)">
      <rect x="-120" y="25" width="240" height="3" :fill="colors.primary" rx="1.5" filter="url(#intense-neon-glow)" opacity="0.7"/>

      <text x="0" y="10" font-family="'Inter', sans-serif" font-weight="700" font-size="36" :fill="colors.textLight" text-anchor="middle" letter-spacing="1.5">
        Annual Review
        <tspan :fill="colors.primary" filter="url(#intense-neon-glow)" opacity="0.8">{{ year }}</tspan>
        <tspan :dx="-String(year).length * 20" :fill="colors.primary">{{ year }}</tspan>
      </text>
    </g>
  </svg>
</template>

<style scoped>
.github-year-icon {
  user-select: none;
}
</style>

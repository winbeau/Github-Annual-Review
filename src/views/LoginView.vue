<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useGitHubStore } from '@/stores/github'
import { Key, ArrowRight, Loader2, AlertCircle } from 'lucide-vue-next'
import GithubYearIcon from '@/components/GithubYearIcon.vue'

const store = useGitHubStore()
const router = useRouter()

const token = ref('')
const isSubmitting = ref(false)
const currentYear = computed(() => new Date().getFullYear())

async function handleSubmit() {
  if (!token.value.trim()) return

  isSubmitting.value = true
  const success = await store.validateAndSetToken(token.value.trim())

  if (success) {
    router.push('/report')
  }
  isSubmitting.value = false
}
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
    <!-- Background Effects -->
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute top-1/4 -left-1/4 w-96 h-96 bg-[#238636]/20 rounded-full blur-3xl"></div>
      <div class="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-[#58a6ff]/20 rounded-full blur-3xl"></div>
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#f778ba]/10 rounded-full blur-3xl"></div>
    </div>

    <!-- Content -->
    <div class="relative z-10 max-w-lg w-full">
      <!-- Logo & Title -->
      <div class="text-center mb-8">
        <div class="inline-block mb-4">
          <GithubYearIcon :year="currentYear" :size="200" />
        </div>
        <h1 class="text-4xl md:text-5xl font-bold mb-4">
          <span class="gradient-text">GitHub</span>
          <span class="text-white"> Annual Review</span>
        </h1>
        <p class="text-[#8b949e] text-lg">
          Discover your coding journey in <span class="text-[#238636] font-semibold">{{ currentYear }}</span>
        </p>
      </div>

      <!-- Login Card -->
      <div class="glass rounded-2xl p-8">
        <div class="mb-6">
          <h2 class="text-xl font-semibold text-white mb-2">Enter your GitHub Token</h2>
          <p class="text-[#8b949e] text-sm">
            We need a personal access token to fetch your GitHub data.
            <a
              href="https://github.com/settings/tokens/new?scopes=read:user,repo"
              target="_blank"
              class="text-[#58a6ff] hover:underline"
            >
              Generate one here →
            </a>
          </p>
        </div>

        <!-- Token Input -->
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div class="relative">
            <Key class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8b949e]" />
            <input
              v-model="token"
              type="password"
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              class="w-full bg-[#0d1117] border border-[#30363d] rounded-lg pl-12 pr-4 py-3 text-white placeholder-[#484f58] focus:outline-none focus:border-[#238636] focus:ring-1 focus:ring-[#238636] transition"
              :disabled="isSubmitting"
            />
          </div>

          <!-- Error Message -->
          <div v-if="store.error" class="flex items-center gap-2 text-red-400 text-sm">
            <AlertCircle class="w-4 h-4" />
            <span>{{ store.error }}</span>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="!token.trim() || isSubmitting"
            class="w-full bg-[#238636] hover:bg-[#2ea043] disabled:bg-[#238636]/50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition btn-glow"
          >
            <Loader2 v-if="isSubmitting" class="w-5 h-5 animate-spin" />
            <template v-else>
              <span>Generate My Report</span>
              <ArrowRight class="w-5 h-5" />
            </template>
          </button>
        </form>

        <!-- Loading Progress -->
        <div v-if="store.loading.isLoading" class="mt-6">
          <div class="flex items-center justify-between text-sm text-[#8b949e] mb-2">
            <span>{{ store.loading.message }}</span>
            <span>{{ store.loading.progress }}%</span>
          </div>
          <div class="h-2 bg-[#0d1117] rounded-full overflow-hidden">
            <div
              class="h-full bg-gradient-to-r from-[#238636] to-[#2ea043] transition-all duration-300"
              :style="{ width: `${store.loading.progress}%` }"
            ></div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="text-center mt-8 text-[#8b949e] text-sm">
        <p>Your token is stored locally and never sent to our servers.</p>
        <p class="mt-2">
          Built with ❤️ using Vue 3 + TypeScript
        </p>
      </div>
    </div>
  </div>
</template>

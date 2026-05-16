<template>
  <div
    id="sidebar-right"
    class="fixed right-0 z-10 flex flex-col items-center justify-start overflow-hidden py-4 text-white transition-all duration-300"
    :class="menuIsExpanded ? 'w-[240px]' : 'w-[64px]'"
    style="height: calc(100vh - 36px); background: linear-gradient(180deg, #0b1433 0%, #050917 100%); border-left: 1px solid #2f3d67"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <div class="flex h-full w-full flex-col justify-between px-3">
      <!-- Avatar et email de l'utilisateur connecté. -->
      <div
        class="flex items-center gap-x-3 rounded-md p-2 transition-colors hover:bg-[rgba(154,101,213,0.12)]"
        :class="menuIsExpanded ? '' : 'justify-center'"
      >
        <!-- Icône utilisateur placeholder. -->
        <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#2f3d67]">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#9ba3bd"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>

        <!-- Email tronqué affiché uniquement quand la sidebar est étendue. -->
        <span v-if="menuIsExpanded" class="max-w-[148px] truncate text-sm font-medium text-[#d6daf0]">
          {{ authStore.userEmail ?? '...' }}
        </span>
      </div>

      <!-- Bouton de déconnexion en bas de la sidebar. -->
      <button
        class="flex h-[44px] w-full items-center gap-x-3 rounded-md text-sm text-[#9ba3bd] transition-colors hover:bg-[rgba(220,38,38,0.12)] hover:text-red-300"
        :class="menuIsExpanded ? 'px-3' : 'justify-center'"
        type="button"
        @click="handleSignOut"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="shrink-0"
        >
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        <span v-if="menuIsExpanded" class="font-medium">Déconnexion</span>
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { Ref } from 'vue'

import { TauriWindowService } from '#src-core/services/TauriWindowService'
import { useAuthStore } from '#src-nuxt/app/stores/auth.store'
import { useWindowTransitionStore } from '#src-nuxt/app/stores/windowTransition.store'

const authStore: ReturnType<typeof useAuthStore> = useAuthStore()
const windowTransitionStore: ReturnType<typeof useWindowTransitionStore> = useWindowTransitionStore()

// La sidebar droite est toujours réduite par défaut, elle s'étend uniquement au survol.
const menuIsExpanded: Ref<boolean> = ref(false)

const onMouseEnter: () => void = (): void => {
  menuIsExpanded.value = true
}

const onMouseLeave: () => void = (): void => {
  menuIsExpanded.value = false
}

// Déconnecte l'utilisateur, reconfigure la fenêtre Tauri et redirige vers le login.
const handleSignOut: () => Promise<void> = async (): Promise<void> => {
  windowTransitionStore.setLoading(true)

  await authStore.signOut()
  await TauriWindowService.configureLoginWindow()
  await navigateTo('/login')
}

</script>

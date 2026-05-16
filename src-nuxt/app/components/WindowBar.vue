<template>
  <div class="relative flex h-9 items-center justify-between bg-black text-center select-none" data-tauri-drag-region>
    <div class="w-[96px]"></div>

    <div class="absolute left-1/2 flex h-full -translate-x-1/2 items-center justify-center pointer-events-none" data-tauri-drag-region>
      <slot></slot>
    </div>

    <div class="flex h-full flex-shrink-0 items-center space-x-1">
      <!-- Bouton de minimisation. -->
      <button
        id="titlebar-minimize"
        class="titlebar-button flex h-full w-8 items-center justify-center hover:bg-gray-800"
        type="button"
        aria-label="Minimiser"
        @click="btnMinimizeWindow"
      >
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#85868a"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>

      <!-- Bouton de maximisation, masqué sur les pages login et signup. -->
      <button
        v-if="!isAuthRoute"
        id="titlebar-maximize"
        class="titlebar-button flex h-full w-8 items-center justify-center hover:bg-gray-800"
        type="button"
        aria-label="Agrandir"
        @click="btnMaximizeWindow"
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#85868a"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <rect x="3" y="3" width="18" height="18" rx="1" />
        </svg>
      </button>

      <!-- Bouton de fermeture. -->
      <button
        id="titlebar-close"
        class="titlebar-button ml-1 flex h-full w-8 items-center justify-center hover:bg-gray-800"
        type="button"
        aria-label="Fermer"
        @click="btnCloseWindow"
      >
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#85868a"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import type { ComputedRef } from 'vue'

import { getCurrentWindow } from '@tauri-apps/api/window'
import type { Window as TauriWindow } from '@tauri-apps/api/window'

const appWindow: TauriWindow = getCurrentWindow()
const route: ReturnType<typeof useRoute> = useRoute()

// Vrai sur les pages d'authentification où le bouton maximize ne doit pas apparaître.
const isAuthRoute: ComputedRef<boolean> = computed(
  (): boolean => route.path === '/login' || route.path === '/signup',
)

/**
 * Minimise la fenetre.
 * @returns {Promise<void>} Promesse résolue après minimisation.
 */
const btnMinimizeWindow: () => Promise<void> = (): Promise<void> => appWindow.minimize()

/**
 * Bascule la fenetre entre maximise et restaure.
 * @returns {Promise<void>} Promesse résolue après le basculement.
 */
const btnMaximizeWindow: () => Promise<void> = (): Promise<void> => appWindow.toggleMaximize()

/**
 * Cache la fenetre.
 * @returns {Promise<void>} Promesse résolue après masquage.
 */
const btnCloseWindow: () => Promise<void> = (): Promise<void> => appWindow.hide()
</script>

<style scoped>
#titlebar-minimize:hover svg,
#titlebar-maximize:hover svg,
#titlebar-close:hover svg {
  stroke: #fff;
}
</style>

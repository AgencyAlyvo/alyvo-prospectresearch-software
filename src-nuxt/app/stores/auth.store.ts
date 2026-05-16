import { defineStore } from 'pinia'
import type { Ref } from 'vue'

import { AuthApiService } from '#src-core/services/AuthApiService'
import type { LoginPayload, SignUpPayload } from '#src-core/types/payload/auth.types'
import type { SignInResponse, SignUpResponse } from '#src-core/types/response/auth.types'

/**
 * Store auth expose apres unwrap Pinia.
 */
type AuthStore = {
  authToken: string | undefined
  isAuthenticated: boolean
  restoreSession: () => void
  signIn: (credentials: LoginPayload) => Promise<void>
  signUp: (credentials: SignUpPayload) => Promise<void>
  signOut: () => Promise<void>
}

/**
 * Store auth interne base sur des refs.
 */
type AuthStoreSetup = {
  authToken: Ref<string | undefined>
  isAuthenticated: Ref<boolean>
  restoreSession: () => void
  signIn: (credentials: LoginPayload) => Promise<void>
  signUp: (credentials: SignUpPayload) => Promise<void>
  signOut: () => Promise<void>
}

/**
 * Type callable du store auth.
 */
type UseAuthStore = () => AuthStore

/**
 * Cle localStorage du token auth.
 */
const AUTH_TOKEN_STORAGE_KEY: string = 'alyvo_auth_token'

export const useAuthStore: UseAuthStore = defineStore('auth', (): AuthStoreSetup => {
  const authToken: Ref<string | undefined> = ref(undefined)
  const isAuthenticated: Ref<boolean> = ref(false)

  /**
   * Applique localement le token retourné par l'API après signin ou signup.
   * @param {SignInResponse | SignUpResponse} response - Reponse auth de l'API.
   * @param {string} source - Nom de l'action auth appelee.
   * @returns {void}
   */
  const applyAuthTokenResponse: (response: SignInResponse | SignUpResponse, source: string) => void = (
    response: SignInResponse | SignUpResponse,
    source: string,
  ): void => {
    const token: string = response.value.trim()

    if (token.length === 0) {
      throw new Error(`Authentication token is missing from ${source} response`)
    }

    authToken.value = token
    isAuthenticated.value = true

    if (import.meta.client) {
      localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token)
    }
  }

  /**
   * Recharge la session locale.
   * @returns {void}
   */
  const restoreSession: () => void = (): void => {
    if (!import.meta.client) {
      return
    }

    const storedToken: string | null = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)

    authToken.value = storedToken || undefined
    isAuthenticated.value = !!storedToken
  }

  /**
   * Connecte l'utilisateur via l'API puis stocke le token localement.
   * @param {LoginPayload} credentials - Identifiants de connexion.
   * @returns {Promise<void>}
   */
  const signIn: (credentials: LoginPayload) => Promise<void> = async (credentials: LoginPayload): Promise<void> => {
    const response: SignInResponse = await AuthApiService.signIn(credentials)
    applyAuthTokenResponse(response, 'signin')
  }

  /**
   * Inscrit l'utilisateur via l'API puis stocke le token localement.
   * @param {SignUpPayload} credentials - Identifiants d'inscription.
   * @returns {Promise<void>}
   */
  const signUp: (credentials: SignUpPayload) => Promise<void> = async (credentials: SignUpPayload): Promise<void> => {
    const response: SignUpResponse = await AuthApiService.signUp(credentials)
    applyAuthTokenResponse(response, 'signup')
  }

  /**
   * Deconnecte l'utilisateur cote API puis efface le token localement.
   * @returns {Promise<void>}
   */
  const signOut: () => Promise<void> = async (): Promise<void> => {
    const token: string | undefined = authToken.value

    try {
      if (token) {
        await AuthApiService.signOut(token)
      }
    } catch (error: unknown) {
      console.error('SignOut error:', error)
    } finally {
      authToken.value = undefined
      isAuthenticated.value = false

      if (import.meta.client) {
        localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
      }
    }
  }

  restoreSession()

  return {
    authToken,
    isAuthenticated,
    restoreSession,
    signIn,
    signUp,
    signOut,
  }
})

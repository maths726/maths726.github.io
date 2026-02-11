/**
 * Sync state store for Google Drive synchronization
 * Manages connection status, sync progress, and error state
 */

import { writable } from 'svelte/store'

// Initial state from localStorage
const initialState = {
  isConnected: localStorage.getItem('gdrive_connected') === 'true',
  isSyncing: false,
  lastSyncAt: localStorage.getItem('gdrive_last_sync') || null,
  userEmail: localStorage.getItem('gdrive_user_email') || null,
  error: null
}

function createSyncStore() {
  const { subscribe, set, update } = writable(initialState)

  return {
    subscribe,

    /**
     * Set connected state after successful sign-in
     * @param {string} email - User's email address
     */
    setConnected(email) {
      update(state => ({
        ...state,
        isConnected: true,
        userEmail: email,
        error: null
      }))
    },

    /**
     * Set disconnected state after sign-out
     */
    setDisconnected() {
      set({
        isConnected: false,
        isSyncing: false,
        lastSyncAt: null,
        userEmail: null,
        error: null
      })
    },

    /**
     * Set syncing state
     * @param {boolean} syncing - Whether sync is in progress
     */
    setSyncing(syncing) {
      update(state => ({
        ...state,
        isSyncing: syncing,
        error: syncing ? null : state.error
      }))
    },

    /**
     * Update last sync time
     * @param {string} timestamp - ISO timestamp
     */
    setLastSync(timestamp) {
      localStorage.setItem('gdrive_last_sync', timestamp)
      update(state => ({
        ...state,
        lastSyncAt: timestamp,
        isSyncing: false
      }))
    },

    /**
     * Set error state
     * @param {string} message - Error message
     */
    setError(message) {
      update(state => ({
        ...state,
        error: message,
        isSyncing: false
      }))
    },

    /**
     * Clear error
     */
    clearError() {
      update(state => ({
        ...state,
        error: null
      }))
    },

    /**
     * Reset store to initial state (for testing)
     */
    reset() {
      set(initialState)
    }
  }
}

export const syncStore = createSyncStore()

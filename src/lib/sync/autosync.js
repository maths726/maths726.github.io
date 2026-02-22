/**
 * Auto-sync module - triggers Google Drive sync after data changes
 * Uses debouncing to avoid excessive API calls
 */

import { syncStore } from '../stores/sync.js'
import { exportAllData } from '../utils/export.js'
import { uploadBackup, isSignedIn, refreshTokenIfNeeded } from './gdrive.js'
import { get } from 'svelte/store'

const DEBOUNCE_DELAY = 5000 // Wait 5 seconds after last change before syncing
let debounceTimer = null
let syncEnabled = true

/**
 * Enable or disable auto-sync
 * @param {boolean} enabled
 */
export function setAutoSyncEnabled(enabled) {
  syncEnabled = enabled
  if (!enabled && debounceTimer) {
    clearTimeout(debounceTimer)
    debounceTimer = null
  }
}

/**
 * Check if auto-sync is enabled
 * @returns {boolean}
 */
export function isAutoSyncEnabled() {
  return syncEnabled
}

/**
 * Trigger auto-sync (debounced)
 * Call this after any data modification
 */
export function triggerAutoSync() {
  // Don't sync if disabled or not connected
  if (!syncEnabled) return

  const state = get(syncStore)
  if (!state.isConnected) return

  // Clear existing timer
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }

  // Set new timer
  debounceTimer = setTimeout(async () => {
    debounceTimer = null
    await performAutoSync()
  }, DEBOUNCE_DELAY)
}

/**
 * Perform the actual sync
 */
async function performAutoSync() {
  const state = get(syncStore)

  // Double-check we're still connected
  if (!state.isConnected || state.isSyncing) return

  // Check token validity
  const tokenValid = await refreshTokenIfNeeded()
  if (!tokenValid || !isSignedIn()) {
    return
  }

  try {
    syncStore.setSyncing(true)
    const data = await exportAllData()
    const result = await uploadBackup(data)
    syncStore.setLastSync(result.modifiedTime || new Date().toISOString())
  } catch (error) {
    console.error('Auto-sync failed:', error)
    // Don't show error for auto-sync failures, just log them
    // User can manually sync if needed
  } finally {
    syncStore.setSyncing(false)
  }
}

/**
 * Cancel any pending auto-sync
 */
export function cancelPendingSync() {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
    debounceTimer = null
  }
}

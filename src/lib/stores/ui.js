import { writable } from 'svelte/store'

export const currentRoute = writable('/')

export const modal = writable({
  isOpen: false,
  component: null,
  props: {}
})

export function openModal(component, props = {}) {
  modal.set({ isOpen: true, component, props })
}

export function closeModal() {
  modal.set({ isOpen: false, component: null, props: {} })
}

export const toast = writable({
  isVisible: false,
  message: '',
  type: 'info'
})

let toastTimeout = null

export function showToast(message, type = 'info', duration = 3000) {
  if (toastTimeout) {
    clearTimeout(toastTimeout)
  }

  toast.set({ isVisible: true, message, type })

  toastTimeout = setTimeout(() => {
    toast.set({ isVisible: false, message: '', type: 'info' })
  }, duration)
}

export function hideToast() {
  if (toastTimeout) {
    clearTimeout(toastTimeout)
  }
  toast.set({ isVisible: false, message: '', type: 'info' })
}

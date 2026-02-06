import { writable } from 'svelte/store'

export const currentRoute = writable('/')

// Dark mode store with localStorage persistence
function createDarkModeStore() {
  const storedValue = typeof localStorage !== 'undefined'
    ? localStorage.getItem('darkMode') === 'true'
    : false

  const { subscribe, set, update } = writable(storedValue)

  return {
    subscribe,
    set: (value) => {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('darkMode', value)
      }
      if (typeof document !== 'undefined') {
        document.documentElement.classList.toggle('dark', value)
      }
      set(value)
    },
    toggle: () => {
      update(current => {
        const newValue = !current
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('darkMode', newValue)
        }
        if (typeof document !== 'undefined') {
          document.documentElement.classList.toggle('dark', newValue)
        }
        return newValue
      })
    },
    init: () => {
      if (typeof document !== 'undefined' && storedValue) {
        document.documentElement.classList.add('dark')
      }
    }
  }
}

export const darkMode = createDarkModeStore()

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

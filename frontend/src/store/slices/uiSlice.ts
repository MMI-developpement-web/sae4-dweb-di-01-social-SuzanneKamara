/**
 * UI Store Slice
 * Gère l'état global de l'interface (modales, overlays, thème)
 */

import { create } from 'zustand'
import type { UIState } from '../types'

export const useUIStore = create<UIState>((set) => ({
  isDarkMode: false,
  isShowingModal: false,
  modalType: null,
  modalData: null,
  isShowingOverlay: false,
  overlayType: null,

  toggleDarkMode: () => {
    set((state) => ({ isDarkMode: !state.isDarkMode }))
  },

  openModal: (type: string, data?: any) => {
    set({
      isShowingModal: true,
      modalType: type,
      modalData: data || null,
    })
  },

  closeModal: () => {
    set({
      isShowingModal: false,
      modalType: null,
      modalData: null,
    })
  },

  openOverlay: (type: string) => {
    set({
      isShowingOverlay: true,
      overlayType: type,
    })
  },

  closeOverlay: () => {
    set({
      isShowingOverlay: false,
      overlayType: null,
    })
  },
}))

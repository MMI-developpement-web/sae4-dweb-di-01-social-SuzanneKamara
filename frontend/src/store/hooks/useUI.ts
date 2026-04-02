/**
 * useUI Hook
 * Accès simplifié au store de l'interface
 */

import { useUIStore } from '../slices/uiSlice'

export const useUI = () => {
  return useUIStore((state) => ({
    isDarkMode: state.isDarkMode,
    isShowingModal: state.isShowingModal,
    modalType: state.modalType,
    modalData: state.modalData,
    isShowingOverlay: state.isShowingOverlay,
    overlayType: state.overlayType,
    toggleDarkMode: state.toggleDarkMode,
    openModal: state.openModal,
    closeModal: state.closeModal,
    openOverlay: state.openOverlay,
    closeOverlay: state.closeOverlay,
  }))
}

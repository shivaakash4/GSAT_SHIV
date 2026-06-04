import { create } from 'zustand';

type ModalTab = 'login' | 'signup';

interface ModalState {
  isOpen: boolean;
  tab: ModalTab;
  openModal: (tab?: ModalTab) => void;
  closeModal: () => void;
  setTab: (tab: ModalTab) => void;
}

export const useModalStore = create<ModalState>((set) => ({
  isOpen:     false,
  tab:        'login',
  openModal:  (tab = 'login') => set({ isOpen: true, tab }),
  closeModal: () => set({ isOpen: false }),
  setTab:     (tab) => set({ tab }),
}));

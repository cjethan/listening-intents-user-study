import { create } from 'zustand';

export const useUserStore = create((set) => ({
  userData: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('userData') || '{}') : {},
  setUserData: (newData) => set((state) => {
    const updatedUserData = { ...state.userData, ...newData };
    if (typeof window !== 'undefined') {
      localStorage.setItem('userData', JSON.stringify(updatedUserData));
    }
    return { userData: updatedUserData };
  }),
  counter: typeof window !== 'undefined' ? parseInt(localStorage.getItem('counter') || '0', 10) : 0,
  incrementCounter: () => set((state) => {
    const newCounter = state.counter + 1;
    if (typeof window !== 'undefined') {
      localStorage.setItem('counter', newCounter.toString());
    }
    return { counter: newCounter };
  }),
  resetCounter: () => set(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('counter', '0');
    }
    return { counter: 0 };
  }),
}));

// store.js (Zustand example)
import { create } from 'zustand';

export const useUserStore = create((set) => ({
  userData: JSON.parse(localStorage.getItem('userData') || '{}'), // Initialize from localStorage
  setUserData: (newData) => set((state) => {
    const updatedUserData = { ...state.userData, ...newData };
    localStorage.setItem('userData', JSON.stringify(updatedUserData)); // Persist to localStorage
    return { userData: updatedUserData };
  }),
  counter: parseInt(localStorage.getItem('counter') || '0', 10), // Initialize from localStorage
  incrementCounter: () => set((state) => {
    const newCounter = state.counter + 1;
    localStorage.setItem('counter', newCounter.toString()); // Persist to localStorage
    return { counter: newCounter };
  }),
  resetCounter: () => set(() => {
    localStorage.setItem('counter', '0'); // Reset counter in localStorage
    return { counter: 0 };
  }),
}));

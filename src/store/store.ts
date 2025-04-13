import { create } from 'zustand';

type UserData = {
  user_id: string;
  name: string;
  age: number;
};

type StoreState = {
  userData: UserData | null;
  counter: number;
  incrementCounter: () => void;
  resetCounter: () => void;
  setUserData: (data: UserData) => void;
};

export const useUserStore = create<StoreState>((set) => ({
  userData: null,
  counter: 0,
  incrementCounter: () => set((state) => ({ counter: state.counter + 1 })),
  resetCounter: () => set(() => ({ counter: 0 })),
  setUserData: (data: UserData) => set((state) => ({ ...state, userData: data })),
}));
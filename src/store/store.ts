import { create } from 'zustand';

// Define the Intent type locally
type Intent = {
  intent_id: string;
  intent_name: string;
  main_listening_function: string;
  listening_functions: string[];
  listening_function_factors: number[];
  survey_intent_names: string[];
  generated_augmented_texts: string[];
};

type UserData = {
  user_id: string;
  prolific_id: string;
  genres: string[];
  play_instrument: string;
  instruments_played: string[];
  instruments_played_years: string | null;
  formal_education: string;
  compose_music: string;
  hours_listening_weekly: number;
  intents: Record<string, Intent>;
};

type StoreState = {
  userData: UserData | null;
  counter: number;
  incrementCounter: () => void;
  resetCounter: () => void;
  setUserData: (data: Partial<UserData>) => void;
};

export const useUserStore = create<StoreState>((set) => ({
  userData: null,
  counter: 0,
  incrementCounter: () => set((state) => ({ counter: state.counter + 1 })),
  resetCounter: () => set(() => ({ counter: 0 })),
  setUserData: (data:any) =>
    set((state) => ({
      userData: { ...state.userData ?? {}, ...data }, // Ensure userData is not null
    })),
}));
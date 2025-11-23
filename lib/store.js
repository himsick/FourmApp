import { create } from 'zustand';

export const useAppStore = create((set, get) => ({
  // --- Advanced features toggle (replaces advancedContext) ---
  advancedEnabled: false,
  setAdvancedEnabled: (value) => set({ advancedEnabled: value }),

  // --- Auth / session state (for future problems) ---
  currentUser: null,
  setCurrentUser: (user) => set({ currentUser: user }),
  clearCurrentUser: () => set({ currentUser: null }),
}));

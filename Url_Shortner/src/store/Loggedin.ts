import { create } from "zustand";

export const isLoggedIn = create((set) => ({
  Logged: false,
  makeLogged: () => set({ Logged: true }),
  makeLogout: () => set({ Logged: false }),
}));

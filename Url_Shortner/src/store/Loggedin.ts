import { create } from "zustand";

export interface LoggedInStore {
  Logged: boolean;
  makeLogged: () => void;
  makeLogout: () => void;
}

export const isLoggedIn = create<LoggedInStore>((set) => ({
  Logged: false,
  makeLogged: () => set({ Logged: true }),
  makeLogout: () => set({ Logged: false }),
}));

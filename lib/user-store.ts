import { create } from "zustand"

type User = {
  name: string
  email: string
  company: string
  phone: string
  role: string
  plan: "free" | "individual" | "planner" | "enterprise"
  scansUsed: number
  scansLimit: number
}

type UserStore = {
  user: User | null
  isLoggedIn: boolean
  setUser: (user: User) => void
  logout: () => void
  updateUser: (updates: Partial<User>) => void
  upgradePlan: (plan: User["plan"]) => void
  useScans: (count: number) => void
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  isLoggedIn: false,
  setUser: (user) => set({ user, isLoggedIn: true }),
  logout: () => set({ user: null, isLoggedIn: false }),
  updateUser: (updates) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null,
    })),
  upgradePlan: (plan) =>
    set((state) => ({
      user: state.user
        ? {
            ...state.user,
            plan,
            scansLimit: plan === "individual" ? 5 : plan === "planner" ? 999 : plan === "enterprise" ? 9999 : 3,
          }
        : null,
    })),
  useScans: (count) =>
    set((state) => ({
      user: state.user
        ? {
            ...state.user,
            scansUsed: state.user.scansUsed + count,
          }
        : null,
    })),
}))

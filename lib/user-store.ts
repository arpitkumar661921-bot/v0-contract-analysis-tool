import { create } from "zustand"
import { persist } from "zustand/middleware"

type User = {
  id: string
  name: string
  email: string
  company: string
  phone: string
  role: string
  plan: "free" | "individual" | "planner" | "enterprise"
  scansUsed: number
  scansLimit: number
  subscriptionStatus: "active" | "pending" | "expired"
  subscriptionExpiry?: string
}

type UserStore = {
  user: User | null
  isLoggedIn: boolean
  setUser: (user: User) => void
  logout: () => void
  updateUser: (updates: Partial<User>) => void
  upgradePlan: (plan: User["plan"]) => void
  setPendingSubscription: (plan: User["plan"]) => void
  activateSubscription: (plan: User["plan"]) => void
  useScans: (count: number) => void
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
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
                subscriptionStatus: "active",
                scansLimit: plan === "individual" ? 5 : plan === "planner" ? 999 : plan === "enterprise" ? 9999 : 3,
                subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              }
            : null,
        })),

      setPendingSubscription: (plan) =>
        set((state) => ({
          user: state.user
            ? {
                ...state.user,
                subscriptionStatus: "pending",
              }
            : null,
        })),

      activateSubscription: (plan) =>
        set((state) => ({
          user: state.user
            ? {
                ...state.user,
                plan,
                subscriptionStatus: "active",
                scansLimit: plan === "individual" ? 5 : plan === "planner" ? 999 : plan === "enterprise" ? 9999 : 3,
                subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
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
    }),
    {
      name: "user-storage",
    },
  ),
)

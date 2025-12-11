import { create } from "zustand"
import { persist } from "zustand/middleware"

export type PaymentRequest = {
  id: string
  uniqueId: string
  userId: string
  userEmail: string
  userName: string
  plan: "individual" | "planner" | "enterprise"
  amount: number
  transactionId: string
  screenshotUrl?: string
  status: "pending" | "approved" | "rejected"
  submittedAt: string
  reviewedAt?: string
  reviewNote?: string
}

type PaymentStore = {
  paymentRequests: PaymentRequest[]
  addPaymentRequest: (request: Omit<PaymentRequest, "id" | "uniqueId" | "status" | "submittedAt">) => string
  approvePayment: (id: string, note?: string) => void
  rejectPayment: (id: string, note?: string) => void
  getPaymentsByUser: (userId: string) => PaymentRequest[]
  getPaymentsByEmail: (email: string) => PaymentRequest[]
  getPendingPayments: () => PaymentRequest[]
  getApprovedPaymentForUser: (email: string) => PaymentRequest | undefined
}

export const usePaymentStore = create<PaymentStore>()(
  persist(
    (set, get) => ({
      paymentRequests: [],

      addPaymentRequest: (request) => {
        const id = `PAY-${Date.now()}`
        const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        const newRequest: PaymentRequest = {
          ...request,
          id,
          uniqueId,
          status: "pending",
          submittedAt: new Date().toISOString(),
        }
        set((state) => ({
          paymentRequests: [...state.paymentRequests, newRequest],
        }))
        return id
      },

      approvePayment: (id, note) =>
        set((state) => ({
          paymentRequests: state.paymentRequests.map((p) =>
            p.id === id
              ? { ...p, status: "approved" as const, reviewedAt: new Date().toISOString(), reviewNote: note }
              : p,
          ),
        })),

      rejectPayment: (id, note) =>
        set((state) => ({
          paymentRequests: state.paymentRequests.map((p) =>
            p.id === id
              ? { ...p, status: "rejected" as const, reviewedAt: new Date().toISOString(), reviewNote: note }
              : p,
          ),
        })),

      getPaymentsByUser: (userId) => get().paymentRequests.filter((p) => p.userId === userId),

      getPaymentsByEmail: (email) => get().paymentRequests.filter((p) => p.userEmail === email),

      getPendingPayments: () => get().paymentRequests.filter((p) => p.status === "pending"),

      getApprovedPaymentForUser: (email) =>
        get().paymentRequests.find((p) => p.userEmail === email && p.status === "approved"),
    }),
    {
      name: "contractlens-payments",
    },
  ),
)

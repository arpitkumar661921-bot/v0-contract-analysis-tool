import { create } from "zustand"

export type AnalyzedContract = {
  id: string
  name: string
  venue: string
  uploadedAt: string
  status: "analyzing" | "analyzed" | "error"
  fileContent: string
  fileType: string
  riskScore: number
  totalValue: string
  basePrice: string
  hiddenFees: Array<{
    name: string
    amount: string
    severity: "high" | "medium" | "low"
    description: string
  }>
  risks: Array<{
    title: string
    severity: "high" | "medium" | "low"
    description: string
  }>
  positives: string[]
  summary: string
  rawText: string
}

type ContractStore = {
  contracts: Map<string, AnalyzedContract>
  currentContractId: string | null
  pendingFile: {
    content: string
    name: string
    type: string
    venue: string
    contractName: string
  } | null
  setPendingFile: (file: ContractStore["pendingFile"]) => void
  addContract: (contract: AnalyzedContract) => void
  updateContract: (id: string, updates: Partial<AnalyzedContract>) => void
  getContract: (id: string) => AnalyzedContract | undefined
  setCurrentContractId: (id: string | null) => void
}

export const useContractStore = create<ContractStore>((set, get) => ({
  contracts: new Map(),
  currentContractId: null,
  pendingFile: null,

  setPendingFile: (file) => set({ pendingFile: file }),

  addContract: (contract) =>
    set((state) => {
      const newContracts = new Map(state.contracts)
      newContracts.set(contract.id, contract)
      return { contracts: newContracts, currentContractId: contract.id }
    }),

  updateContract: (id, updates) =>
    set((state) => {
      const newContracts = new Map(state.contracts)
      const existing = newContracts.get(id)
      if (existing) {
        newContracts.set(id, { ...existing, ...updates })
      }
      return { contracts: newContracts }
    }),

  getContract: (id) => get().contracts.get(id),

  setCurrentContractId: (id) => set({ currentContractId: id }),
}))

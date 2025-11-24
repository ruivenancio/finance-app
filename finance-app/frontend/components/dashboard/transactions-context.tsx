"use client"

import { createContext, useContext } from "react"

interface TransactionsContextType {
    refreshTransactions: () => void
}

const TransactionsContext = createContext<TransactionsContextType>({
    refreshTransactions: () => { },
})

export const useTransactions = () => useContext(TransactionsContext)

export const TransactionsProvider = TransactionsContext.Provider

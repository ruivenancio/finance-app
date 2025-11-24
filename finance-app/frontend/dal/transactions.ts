import api from "@/lib/api";
import { TransactionFormValues } from "@/lib/schemas";

export const transactionsDal = {
    getAll: async () => {
        return api.get("/transactions/");
    },
    create: async (data: any) => {
        return api.post("/transactions", data);
    },
    update: async (id: string, data: any) => {
        return api.put(`/transactions/${id}`, data);
    },
    delete: async (id: string) => {
        return api.delete(`/transactions/${id}`);
    },
    transfer: async (data: any) => {
        return api.post("/transactions/transfer", data);
    },
};

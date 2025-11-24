import api from "@/lib/api";

export const stocksDal = {
    getAll: async () => {
        return api.get("/stocks/");
    },
    create: async (data: any) => {
        return api.post("/stocks/", data);
    },
    sync: async () => {
        return api.post("/stocks/sync");
    },
    delete: async (id: string) => {
        return api.delete(`/stocks/${id}`);
    },
    getDetails: async (id: string) => {
        return api.get(`/stocks/${id}`);
    },
    getTransactions: async (id: string) => {
        return api.get(`/stocks/${id}/transactions`);
    },
    addTransaction: async (id: string, data: any) => {
        return api.post(`/stocks/${id}/transactions`, data);
    },
};

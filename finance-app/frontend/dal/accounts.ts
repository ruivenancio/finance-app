import api from "@/lib/api";
import { AccountFormValues } from "@/lib/schemas";

export const accountsDal = {
    getAll: async () => {
        return api.get("/accounts");
    },
    create: async (data: any) => {
        return api.post("/accounts", data);
    },
    update: async (id: string, data: any) => {
        return api.put(`/accounts/${id}`, data);
    },
    delete: async (id: string) => {
        return api.delete(`/accounts/${id}`);
    },
};

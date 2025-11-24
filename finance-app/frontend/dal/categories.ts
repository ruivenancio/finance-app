import api from "@/lib/api";
import { CategoryFormValues } from "@/lib/schemas";

export const categoriesDal = {
    getAll: async () => {
        return api.get("/categories");
    },
    create: async (data: any) => {
        return api.post("/categories", data);
    },
    update: async (id: string, data: any) => {
        return api.put(`/categories/${id}`, data);
    },
    delete: async (id: string) => {
        return api.delete(`/categories/${id}`);
    },
};

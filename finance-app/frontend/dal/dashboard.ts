import api from "@/lib/api";

export const dashboardDal = {
    getSummary: async () => {
        return api.get("/dashboard/summary");
    },
};

import api from "@/lib/api";

export const authDal = {
    login: async (data: any) => {
        const params = new URLSearchParams();
        params.append('username', data.username);
        params.append('password', data.password);
        return api.post("/auth/login", params);
    },
    register: async (data: any) => {
        return api.post("/auth/register", data);
    },
    getMe: async () => {
        return api.get("/auth/me");
    },
};

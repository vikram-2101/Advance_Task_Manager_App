// src/api/authApi.js
import axiosClient from "./axiosClient.js";

export const authApi = {
  register: (email, name, password) =>
    axiosClient.post("/auth/register", {
      email,
      name,
      password,
      confirmPassword: password,
    }),

  login: (email, password) =>
    axiosClient.post("/auth/login", { email, password }),

  refreshToken: (refreshToken) =>
    axiosClient.post("/auth/refresh", { refreshToken }),

  getProfile: () => axiosClient.get("/auth/profile"),
};

export default authApi;

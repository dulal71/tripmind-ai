import axios from "axios";
import { authClient } from "./auth-client";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
});

api.interceptors.request.use(async (config) => {
  if (typeof window !== 'undefined') {
    try {
      const session = await authClient.getSession();
      const token = session?.data?.session?.token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // No active session
    }
  }
  return config;
});

export default api;

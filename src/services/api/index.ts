import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import store from "@/store";
import router from "@/router";
// const baseDomain = process.env.VUE_APP_BASE_API_URL;
const baseDomain = "https://api.drawberry.io";
// const baseDomain = "http://localhost:4000";
const baseURL = `${baseDomain}/api/v1`;

const httpClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    Accept: "application/json",
  },
});

httpClient.interceptors.request.use(async (config: any) => {
  const params = config.params;
  const token = localStorage.getItem("access-token") || "";

  config.headers.Authorization = `Bearer ${token}`;

  if (params && params.hideProgressBar) {
    return config;
  }

  return config;
});

httpClient.interceptors.response.use(
  async (config: AxiosResponse) => {
    return config;
  },
  async function (error: AxiosError) {
    if (error.response?.status === 401 || error.response?.status === 403) {
      store.commit("auth/LOGOUT");
      await router.push("/login");
    }
    return Promise.reject(error);
  }
);

httpClient.defaults.timeout = 20000;

export default httpClient;

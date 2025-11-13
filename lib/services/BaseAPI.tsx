import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";
import APPConfig from "../config";
import { showToast } from "@/components/common/Toast";

const createAPIService = (url = "") => {
  // Set the default API URL properly
  const baseURL = url && url.length > 0 ? url : APPConfig.API_URL;
  const instance: AxiosInstance = axios.create({
    withCredentials: true,
  });

  console.log("API Base URL:", baseURL);

  // Add a request interceptor
  instance.interceptors.request.use(async (config) => {
    // Get the token
    const access_token = localStorage.getItem("access_token");

    config.headers["x-api-key"] = APPConfig.API_KEY;
    // Get the current config so that we can call the method if there is a token expired error
    // Do not get the config for refresh token call, because it means that it's refreshing the token

    if (access_token && access_token.length > 0 && access_token !== "undefined")
      config.headers.Authorization = "Bearer " + access_token;
    return config;
  });

  // Add common response error handler
  instance.interceptors.response.use(
    (response) => {
      // Do something with the response data
      return response;
    },
    async (error: AxiosError & { response: { data: any } }) => {
      if (error?.code === "ERR_NETWORK") {
        showToast({
          type: "error",
          message: "Network error. Please check your connection.",
          actionLabel: "Dismiss",
        });
        return Promise.reject(error);
      }

      const originalRequest = error.config as typeof error.config & {
        _retry: boolean;
      };

      // If the error is a 401 Unauthorized and it's not a retry attempt
      // Also check if it's not a refresh token request to avoid infinite loops
      if (
        error?.response?.status === 401 &&
        !originalRequest._retry &&
        !originalRequest.url?.includes("auth/refresh-token")
      ) {
        originalRequest._retry = true;

        try {
          // Attempt to refresh the access token
          const { data } = await axios.post(
            buildURL("auth/refresh-token"),
            {},
            {
              withCredentials: true,
              headers: {
                "x-api-key": APPConfig.API_KEY,
              },
            }
          );

          localStorage.setItem("access_token", data.access_token);
          // Retry the original request with the new access token
          originalRequest.headers["Authorization"] =
            `Bearer ${data.access_token}`;
          return instance(originalRequest);
        } catch (refreshError: any) {
          console.error("Refresh token error", refreshError);
          localStorage.removeItem("access_token");

          // Only logout if refresh token is expired/invalid
          if (refreshError?.response?.status === 401) {
            try {
              await axios.post(
                buildURL("auth/logout"),
                {},
                {
                  withCredentials: true,
                  headers: {
                    "x-api-key": APPConfig.API_KEY,
                  },
                }
              );
            } catch (logoutError) {
              console.error("Logout error", logoutError);
            }
          }

          // Store the session expired message in localStorage
          // Will be used to show a toast on the login page
          localStorage.setItem(
            "session_expired_toast",
            "Your session has expired. Please log in again."
          );

          // Redirect to login only if not already there
          if (window.location.pathname !== "/login") {
            window.location.href = "/login";
          }

          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );

  const buildURL = (method: string): string => {
    return baseURL + "/" + method;
  };

  const get = async (method: string) => {
    const response = await instance.get(buildURL(method));
    return response;
  };

  const post = async (data: any, method: string) => {
    const response = await instance.post(buildURL(method), data);
    console.log("POST response:", response);
    return response;
  };

  const put = async (data: any, method: string) => {
    const response = await instance.put(buildURL(method), data);
    return response;
  };

  const patch = async (data: any, method: string) => {
    const response = await instance.patch(buildURL(method), data);
    return response;
  };

  const remove = async (method: string) => {
    const response = await instance.delete(buildURL(method));
    return response;
  };

  return {
    get,
    post,
    put,
    patch,
    remove,
  };
};

export default createAPIService;

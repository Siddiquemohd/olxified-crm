import axios, {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import StorageManager from "./StorageManager";

const isServer = typeof window === "undefined";
const defaultBaseURL = "http://192.168.1.3:8003/api/v1/olxified";

const axiosInstance = axios.create({
  baseURL: defaultBaseURL,
  withCredentials: true,
});


export default class AxiosProvider {
  private instance: AxiosInstance;
  private baseURL: string;
  private storage: StorageManager;

  constructor(baseURL: string = defaultBaseURL) {
    this.baseURL = isServer
      ? process.env.NEXT_PUBLIC_API_URL || baseURL
      : baseURL;

    this.storage = new StorageManager();
    this.instance = axios.create({
      baseURL: this.baseURL,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    this.instance.interceptors.request.use(
      this.handleRequest.bind(this),
      (error) => Promise.reject(error)
    );

    this.instance.interceptors.response.use(
      this.handleResponse.bind(this),
      this.handleError.bind(this)
    );
  }

  private async handleRequest(
    config: InternalAxiosRequestConfig
  ): Promise<InternalAxiosRequestConfig> {
    try {
      const accessToken = this.storage.getAccessToken();
      console.log("Access token***", accessToken);

      if (accessToken) {
        config.headers.set("Authorization", `Bearer ${accessToken}`);
      }
    } catch (error) {
      console.error("Error setting request headers:", error);
    }

    return config;
  }

  async post<T = any>(
    url: string,
    data: any,
    config?: InternalAxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.instance.post<T>(url, data, config);
  }

  async get<T = any>(
    url: string,
    config?: InternalAxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.instance.get<T>(url, config);
  }

  async put<T = any>(
    url: string,
    data: any,
    config?: InternalAxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.instance.put<T>(url, data, config);
  }

  async delete<T = any>(
    url: string,
    config?: InternalAxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.instance.delete<T>(url, config);
  }

  private handleResponse(response: AxiosResponse): AxiosResponse {
    return response;
  }

  private handleError(error: any): Promise<never> {
    console.error("Error:", error);
    if (error.response?.status === 401 && !isServer) {
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
}

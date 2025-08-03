import axios, {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
  AxiosHeaders
} from "axios";
import StorageManager from "./StorageManager";

const isServer = typeof window === "undefined";
const defaultBaseURL = "http://192.168.0.105:8003/api/v1/olxified";

export default class AxiosProvider {
  baseUrl(arg0: string, baseUrl: any) {
    throw new Error("Method not implemented.");
  }
  private instance: AxiosInstance;
  private baseURL: string;
  private storage: StorageManager;
  defaults: any;

  constructor(baseURL: string = defaultBaseURL) {
    this.baseURL = isServer
      ? process.env.NEXT_PUBLIC_API_URL || baseURL
      : baseURL;

    this.storage = new StorageManager();

    // Initialize with proper AxiosHeaders
    const headers = new AxiosHeaders();
    headers.set('Content-Type', 'application/x-www-form-urlencoded');

    this.instance = axios.create({
      baseURL: this.baseURL,
      headers: headers,
      withCredentials: true
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

      if (accessToken && config.headers) {
        // Use proper header setting method
        const headers = new AxiosHeaders(config.headers);
        headers.set('Authorization', `Bearer ${accessToken}`);
        config.headers = headers;
      }
    } catch (error) {
      console.error("Error setting request headers:", error);
    }

    return config;
  }

  // Update method signatures to properly handle headers
  async post<T = any>(
    url: string,
    data: any,
    config?: Omit<InternalAxiosRequestConfig, 'headers'> & { headers?: Record<string, string> }
  ): Promise<AxiosResponse<T>> {
    if (config?.headers) {
      const headers = new AxiosHeaders(this.instance.defaults.headers);
      Object.entries(config.headers).forEach(([key, value]) => {
        headers.set(key, value);
      });
      return this.instance.post<T>(url, data, { ...config, headers });
    }
    return this.instance.post<T>(url, data, config);
  }

  async get<T = any>(
    url: string,
    config?: Omit<InternalAxiosRequestConfig, 'headers'> & { headers?: Record<string, string> }
  ): Promise<AxiosResponse<T>> {
    if (config?.headers) {
      const headers = new AxiosHeaders(this.instance.defaults.headers);
      Object.entries(config.headers).forEach(([key, value]) => {
        headers.set(key, value);
      });
      return this.instance.get<T>(url, { ...config, headers });
    }
    return this.instance.get<T>(url, config);
  }

  async put<T = any>(
    url: string,
    data: any,
    config?: Omit<InternalAxiosRequestConfig, 'headers'> & { headers?: Record<string, string> }
  ): Promise<AxiosResponse<T>> {
    if (config?.headers) {
      const headers = new AxiosHeaders(this.instance.defaults.headers);
      Object.entries(config.headers).forEach(([key, value]) => {
        headers.set(key, value);
      });
      return this.instance.put<T>(url, data, { ...config, headers });
    }
    return this.instance.put<T>(url, data, config);
  }

  async delete<T = any>(
    url: string,
    config?: Omit<InternalAxiosRequestConfig, 'headers'> & { headers?: Record<string, string> }
  ): Promise<AxiosResponse<T>> {
    if (config?.headers) {
      const headers = new AxiosHeaders(this.instance.defaults.headers);
      Object.entries(config.headers).forEach(([key, value]) => {
        headers.set(key, value);
      });
      return this.instance.delete<T>(url, { ...config, headers });
    }
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
import axios, { type InternalAxiosRequestConfig, type AxiosResponse, type AxiosInstance } from 'axios';

const service: AxiosInstance = axios.create({
  baseURL: __API_URL__,
  timeout: 120 * 1000,
});

service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (config.data) {
      const adminPass = localStorage.getItem('adminPassword') ?? '';
      if (config.data instanceof FormData) {
        config.headers['Content-Type'] = 'multipart/form-data';
        if (adminPass) config.data?.append('adminPass', adminPass);
      } else if (typeof config.data === 'object' && !config.headers['Content-Type']) {
        config.headers['Content-Type'] = 'application/json';
        if (adminPass) config.data.adminPass = adminPass;
      }
    }

    return config;
  },
  (error) => {
    console.error('请求错误:', error);
    return Promise.reject(error);
  },
);

service.interceptors.response.use(
  (response: AxiosResponse) => {
    const res = response.data;
    return res;
  },
  (error) => {
    console.error('请求错误:', error.message);

    if (error.message.includes('timeout')) {
      console.error('请求超时，请重试');
    } else if (error.message.includes('401')) {
      console.error('未授权，请登录');
    } else if (error.message.includes('403')) {
      console.error('权限不足');
    } else if (error.message.includes('404')) {
      console.error('请求地址不存在');
    }

    return Promise.reject(error);
  },
);

const request = {
  get<T>(url: string, params?: any, config?: InternalAxiosRequestConfig): Promise<T> {
    return service.get(url, { params, ...config });
  },

  post<T>(url: string, data?: any, config?: InternalAxiosRequestConfig): Promise<T> {
    return service.post(url, data, config);
  },

  put<T>(url: string, data?: any, config?: InternalAxiosRequestConfig): Promise<T> {
    return service.put(url, data, config);
  },

  delete<T>(url: string, params?: any, config?: InternalAxiosRequestConfig): Promise<T> {
    return service.delete(url, { params, ...config });
  },
};

export default request;

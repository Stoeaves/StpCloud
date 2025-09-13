import axios, {
  type InternalAxiosRequestConfig,
  type AxiosResponse,
  type AxiosInstance,
} from 'axios';

// 创建axios实例
const service: AxiosInstance = axios.create({
  baseURL: __API_URL__, // 从环境变量中获取基础URL[1](@ref)
  timeout: 60 * 1000, // 请求超时时间
});

// 请求拦截器
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (config.data) {
      if (config.data instanceof FormData) {
        config.headers['Content-Type'] = 'multipart/form-data';
        const adminPass = localStorage.getItem('adminPassword') ?? '';
        config.data?.append('adminPass', adminPass);
      } else if (
        typeof config.data === 'object' &&
        !config.headers['Content-Type']
      ) {
        config.headers['Content-Type'] = 'application/json';
      }
    }

    return config;
  },
  (error) => {
    // 处理请求错误
    console.error('请求错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    // 处理响应数据
    const res = response.data;
    return res;
  },
  (error) => {
    // 处理响应错误
    console.error('请求错误:', error.message);

    // 可以添加错误处理逻辑，例如判断网络状态、重新请求等
    if (error.message.includes('timeout')) {
      console.error('请求超时，请重试');
    } else if (error.message.includes('401')) {
      console.error('未授权，请登录');
      // 可以跳转到登录页
      // router.push('/login')
    } else if (error.message.includes('403')) {
      console.error('权限不足');
    } else if (error.message.includes('404')) {
      console.error('请求地址不存在');
    }

    return Promise.reject(error);
  }
);

// 封装请求方法
const request = {
  get<T>(
    url: string,
    params?: any,
    config?: InternalAxiosRequestConfig
  ): Promise<T> {
    return service.get(url, { params, ...config });
  },

  post<T>(
    url: string,
    data?: any,
    config?: InternalAxiosRequestConfig
  ): Promise<T> {
    return service.post(url, data, config);
  },

  put<T>(
    url: string,
    data?: any,
    config?: InternalAxiosRequestConfig
  ): Promise<T> {
    return service.put(url, data, config);
  },

  delete<T>(
    url: string,
    params?: any,
    config?: InternalAxiosRequestConfig
  ): Promise<T> {
    return service.delete(url, { params, ...config });
  },
};

export default request;

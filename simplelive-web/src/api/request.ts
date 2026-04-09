// src/api/request.ts
import axios from 'axios';

// 创建 axios 实例
const request = axios.create({
    baseURL: 'https://localhost:5300', // 这里以后换成你 YARP 网关的地址
    timeout: 10000, // 超时时间
});

// 请求拦截器：每次发请求前，自动把 Token 塞进请求头
request.interceptors.request.use(
    (config) => {
        // 从 localStorage 中取出 Zustand 存的 Token
        const authStore = localStorage.getItem('user-storage');
        if (authStore) {
            try {
                const { state } = JSON.parse(authStore);
                if (state.token) {
                    config.headers.Authorization = `Bearer ${state.token}`;
                }
            } catch (error) {
                console.error('解析 Token 失败', error);
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// 响应拦截器：统一处理后端的 400/401 错误
request.interceptors.response.use(
    (response) => response,
    (error) => {
        // 统一提取你后端定义的 { Message: "xxx" }
        const errorMessage = error.response?.data?.Message || '网络请求异常，请稍后重试';

        if (error.response?.status === 401) {
            // 以后这里可以加上自动跳转登录页的逻辑
            console.error('未授权或 Token 过期:', errorMessage);
        }

        // 将错误信息包装后抛出，方便在业务层 try-catch
        return Promise.reject(new Error(errorMessage));
    }
);

export default request;
// src/api/request.ts
import axios from 'axios';
import { useUserStore } from '@/store/User/useUserStore'

// 创建 axios 实例
const request = axios.create({
    baseURL: 'https://localhost:5300', // 这里以后换成你 YARP 网关的地址
    timeout: 10000, // 超时时间
});

// 请求拦截器：每次发请求前，自动把 Token 塞进请求头
request.interceptors.request.use(
    (config) => {
        // 💡 教学点：在非 React 组件（普通 JS/TS 文件）中，直接用 getState() 读取当前内存状态
        const tokenData = useUserStore.getState().token;

        if (tokenData) {
            // 兼容对象和字符串的情况
            const actualToken = typeof tokenData === 'string'
                ? tokenData
                : (tokenData as any).accessToken;

            if (actualToken) {
                config.headers.Authorization = `Bearer ${actualToken}`;
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
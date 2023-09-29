import { fileURLToPath, URL } from 'node:url'
import { loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

export default {
  server: {
    proxy: {
      '/auth': {
        // eslint-disable-next-line no-undef
        target: loadEnv('development', process.cwd()).VITE_PROXY_TARGET, // 设置代理目标
        changeOrigin: true // 设置是否跨域
      },
      '/org': {
        // eslint-disable-next-line no-undef
        target: loadEnv('development', process.cwd()).VITE_PROXY_TARGET, // 设置代理目标
        changeOrigin: true // 设置是否跨域
      },
      '/catalog/': {
        // eslint-disable-next-line no-undef
        target: loadEnv('development', process.cwd()).VITE_PROXY_TARGET, // 设置代理目标
        changeOrigin: true // 设置是否跨域
      },
      '/catalog?': {
        // eslint-disable-next-line no-undef
        target: loadEnv('development', process.cwd()).VITE_PROXY_TARGET, // 设置代理目标
        changeOrigin: true // 设置是否跨域
      },
      '/category': {
        // eslint-disable-next-line no-undef
        target: loadEnv('development', process.cwd()).VITE_PROXY_TARGET, // 设置代理目标
        changeOrigin: true // 设置是否跨域
      },
      '/product': {
        // eslint-disable-next-line no-undef
        target: loadEnv('development', process.cwd()).VITE_PROXY_TARGET, // 设置代理目标
        changeOrigin: true // 设置是否跨域
      },
      '/m-category': {
        // eslint-disable-next-line no-undef
        target: loadEnv('development', process.cwd()).VITE_PROXY_TARGET, // 设置代理目标
        changeOrigin: true // 设置是否跨域
      },
      '/fileStorage': {
        // eslint-disable-next-line no-undef
        target: loadEnv('development', process.cwd()).VITE_PROXY_TARGET, // 设置代理目标
        changeOrigin: true // 设置是否跨域
      },
      '/productUnit': {
        // eslint-disable-next-line no-undef
        target: loadEnv('development', process.cwd()).VITE_PROXY_TARGET, // 设置代理目标
        changeOrigin: true // 设置是否跨域
      },
      '/chat/': {
        // eslint-disable-next-line no-undef
        target: loadEnv('development', process.cwd()).VITE_PROXY_TARGET, // 设置代理目标
        changeOrigin: true // 设置是否跨域,
      },
      '/order-guide': {
        // eslint-disable-next-line no-undef
        target: loadEnv('development', process.cwd()).VITE_PROXY_TARGET, // 设置代理目标
        changeOrigin: true // 设置是否跨域,
      },
      '/orders/': {
        // eslint-disable-next-line no-undef
        target: loadEnv('development', process.cwd()).VITE_PROXY_TARGET, // 设置代理目标
        changeOrigin: true // 设置是否跨域,
      }
    }
  },
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
}

import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

interface UserState {
  token: string | null
  setToken: (token: string) => void
  clearToken: () => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      token: null,
      setToken: (token) => set({ token }),
      clearToken: () => set({ token: null }),
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => localStorage),
      // 教学点：persist 的核心是“每次状态变更序列化到 localStorage，
      // 初始化时再反序列化回内存”，相当于前端版的轻量状态快照恢复。
      partialize: (state) => ({ token: state.token }),
    },
  ),
)

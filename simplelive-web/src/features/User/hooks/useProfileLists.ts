import { useState, useCallback, useEffect } from 'react'
import { getMyFollowsApi, getMyHistoryApi, type FollowingUserDto, type WatchHistoryDto } from '@/api/User/profileApi'
import { useUserStore } from '@/store/User/useUserStore'

// 💡 教学点：极致 DRY 原则。因为关注和历史的加载逻辑高度一致，
// 我们不写两个 Hook，而是写一个联合 Hook 根据传入的 type 来决定调哪个接口。
export const useProfileLists = (type: 'follows' | 'history') => {
    const token = useUserStore((state) => state.token)
    const [isLoading, setIsLoading] = useState(false)
    const [follows, setFollows] = useState<FollowingUserDto[]>([])
    const [histories, setHistories] = useState<WatchHistoryDto[]>([])
    const [error, setError] = useState<string | null>(null)

    const loadData = useCallback(async () => {
        if (!token) return
        setIsLoading(true)
        setError(null)

        try {
            if (type === 'follows') {
                const res = await getMyFollowsApi()
                setFollows(res.queryable)
            } else {
                const res = await getMyHistoryApi()
                setHistories(res.queryable)
            }
        } catch (err: any) {
            setError(err.message || '加载数据失败')
        } finally {
            setIsLoading(false)
        }
    }, [type, token])

    useEffect(() => {
        void loadData()
    }, [loadData])

    return { isLoading, follows, histories, error, refresh: loadData }
}
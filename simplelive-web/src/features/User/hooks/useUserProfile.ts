import { useState, useCallback, useEffect } from 'react'
import { getMyProfileApi, type UserProfileDto } from '@/api/User/profileApi'
import { useUserStore } from '@/store/User/useUserStore'

// 💡 教学点：单一职责原则。
// 这个 Hook 专门负责拉取、缓存、刷新当前登录用户的 Profile。
// 以后如果需要在别的地方（比如顶侧边栏）显示用户等级、粉丝数，直接复用这个 Hook 即可。
export const useUserProfile = () => {
    const token = useUserStore((state) => state.token)
    const [isLoading, setIsLoading] = useState(true)
    const [profile, setProfile] = useState<UserProfileDto | null>(null)
    const [error, setError] = useState<string | null>(null)

    const loadProfile = useCallback(async () => {
        if (!token) {
            setIsLoading(false)
            return
        }

        setIsLoading(true)
        setError(null)

        try {
            const data = await getMyProfileApi()
            setProfile({
                ...data,
                age: calculateAge(data.dateOfBirth)
            })
        } catch (err: any) {
            setError(err.message || '获取个人信息失败')
        } finally {
            setIsLoading(false)
        }
    }, [token])


    useEffect(() => {
        void loadProfile()
    }, [loadProfile])

    return { profile, isLoading, error, refresh: loadProfile }
}


const calculateAge = (dateOfBirth?: string | null): number | null => {
    if (!dateOfBirth) return null

    const birthDate = new Date(dateOfBirth)
    const today = new Date()

    // 无效日期处理
    if (isNaN(birthDate.getTime())) return null

    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--
    }

    return age >= 0 ? age : null
}
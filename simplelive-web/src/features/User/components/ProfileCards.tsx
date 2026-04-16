import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import type { FollowingUserDto, WatchHistoryDto } from '@/api/User/profileApi'

// 💡 教学点：提取底层纯 UI 组件。
// 不管是关注列表还是历史列表，只要符合这个视觉结构，都可以复用这个外壳。
interface HorizontalStreamCardProps {
    linkTo: string
    avatar: string
    title: string
    subtitle: string
    categoryInfo: string
    followerInfo: string
    isLive?: boolean
}

const HorizontalStreamCard = ({ linkTo, avatar, title, subtitle, categoryInfo, followerInfo, isLive }: HorizontalStreamCardProps) => (
    <Link to={linkTo} className="block">
        <div className="flex gap-4 p-3 bg-white border border-slate-100/80 rounded-2xl hover:border-slate-200 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer">
            <div className="relative w-[130px] aspect-[16/10] rounded-xl overflow-hidden bg-slate-100 shrink-0 flex items-center justify-center">
                <img src={avatar} alt={title} className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
                {isLive && (
                    <div className="absolute top-1.5 right-1.5 bg-rose-500 text-white text-[10px] font-bold px-1.5 py-[2px] rounded-md tracking-wide shadow-sm">
                        直播中
                    </div>
                )}
            </div>
            <div className="flex flex-col justify-center py-1 overflow-hidden min-w-0 flex-1">
                <h3 className="text-[15px] font-semibold text-slate-900 truncate mb-1 group-hover:text-blue-600 transition-colors">{title}</h3>
                <p className="text-[12px] text-slate-500 truncate mb-2">{subtitle}</p>
                <div className="flex items-center gap-4 text-[12px] text-slate-400 mt-auto">
                    <span className="truncate">{categoryInfo}</span>
                    <span className="shrink-0">{followerInfo}</span>
                </div>
            </div>
        </div>
    </Link>
)

// --- 关注主播卡片 ---
export const FollowCard = ({ user }: { user: FollowingUserDto }) => {
    return (
        <HorizontalStreamCard
            linkTo={`/live/${user.hostId}`} // 注意：MVP阶段用 hostId 占位，实际可能需跳转 roomNumber
            avatar={user.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=fallback'}
            title={user.nickName}
            subtitle={user.isLive ? '正在直播中...' : '主播暂未开播'}
            categoryInfo={`状态: ${user.isLive ? '直播中' : '休息中'}`}
            followerInfo={`粉丝: ${user.followerCount}`}
            isLive={user.isLive}
        />
    )
}

// --- 历史记录卡片 ---
export const HistoryCard = ({ history }: { history: WatchHistoryDto }) => {
    // 提取时间：如 14:30
    const timeStr = new Date(history.lastWatchTime).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })

    return (
        <HorizontalStreamCard
            linkTo={`/live/${history.roomNumber}`}
            avatar={'https://via.placeholder.com/300x180?text=Room+' + history.roomNumber} // 历史暂无封面，用占位
            title={`直播间 ${history.roomNumber}`}
            subtitle={`上次观看时间：${timeStr}`}
            categoryInfo={`房间: ${history.roomNumber}`}
            followerInfo="历史记录"
            isLive={false}
        />
    )
}
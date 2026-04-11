import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import type { LiveRoomSummaryDto } from '@/api/Live/roomApi'

interface StreamCardProps {
  room: LiveRoomSummaryDto
}

// 💡 修复 1：加上极其严密的空值兜底 (Fallback)
const formatOnlineCount = (count?: number | null): string => {
  // 如果后端传过来 null 或者 undefined，强行转成 0，防止程序崩溃
  const safeCount = count ?? 0;

  if (safeCount >= 10000) {
    return `${(safeCount / 10000).toFixed(1)}万人在看`
  }

  return `${safeCount.toLocaleString('zh-CN')}人在看`
}

export const StreamCard = ({ room }: StreamCardProps) => {
  return (
    // 💡 修复 2：将所有大驼峰属性改成小驼峰 (匹配 C# 实际传输的 JSON 格式)
    <Link to={`/live/${room.roomNumber}`} className="block">
      <motion.article
        whileHover={{
          y: -5,
          transition: {
            type: 'spring',
            stiffness: 300,
            damping: 24,
          },
        }}
        className="group overflow-hidden rounded-3xl border border-slate-200/70 bg-white"
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
          {/* 增加兜底：如果没封面图，不至于图片裂开 */}
          <img
            src={room.coverImageUrl || 'https://via.placeholder.com/600x375?text=No+Cover'}
            alt={room.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </div>

        <div className="space-y-3 bg-[#f8fafc] px-4 py-4">
          <h3 className="line-clamp-2 min-h-12 text-[18px] font-bold leading-[1.25] text-slate-900">
            {/* 使用小写 title */}
            {room.title ?? '未知直播间'}
          </h3>

          <div className="flex items-center justify-between gap-3 text-slate-500">
            <div className="flex min-w-0 items-center gap-2">
              <img
                src={room.hostAvatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=fallback'}
                alt={room.hostUserName}
                className="h-7 w-7 shrink-0 rounded-full object-cover bg-slate-200"
              />
              <span className="truncate text-[15px]">{room.hostUserName ?? '神秘主播'}</span>
            </div>
            {/* 传入小写 onlineCount */}
            <span className="shrink-0 text-[14px]">{formatOnlineCount(room.onlineCount)}</span>
          </div>
        </div>
      </motion.article>
    </Link>
  )
}
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import type { LiveRoomSummaryDto } from '@/api/Live/roomApi'

interface StreamCardProps {
  room: LiveRoomSummaryDto
}

const formatOnlineCount = (count: number): string => {
  if (count >= 10000) {
    return `${(count / 10000).toFixed(1)}万人在看`
  }

  return `${count.toLocaleString('zh-CN')}人在看`
}

export const StreamCard = ({ room }: StreamCardProps) => {
  return (
    <Link to={`/live/${room.RoomNumber}`} className="block">
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
          <img
            src={room.CoverImageUrl}
            alt={room.Title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </div>

        <div className="space-y-3 bg-[#f8fafc] px-4 py-4">
          <h3 className="line-clamp-2 min-h-12 text-[18px] font-bold leading-[1.25] text-slate-900">
            {room.Title}
          </h3>

          <div className="flex items-center justify-between gap-3 text-slate-500">
            <div className="flex min-w-0 items-center gap-2">
              <img
                src={room.HostAvatarUrl}
                alt={room.HostUserName}
                className="h-7 w-7 shrink-0 rounded-full object-cover"
              />
              <span className="truncate text-[15px]">{room.HostUserName}</span>
            </div>
            <span className="shrink-0 text-[14px]">{formatOnlineCount(room.OnlineCount)}</span>
          </div>
        </div>
      </motion.article>
    </Link>
  )
}

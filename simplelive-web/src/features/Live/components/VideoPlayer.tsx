import { motion } from 'framer-motion'

interface VideoPlayerProps {
  title: string
  category: string
  hostName: string
  playUrl?: string
  isLive?: boolean
}

export const VideoPlayer = ({
  title,
  category,
  hostName,
  playUrl,
  isLive = false,
}: VideoPlayerProps) => {
  return (
    <motion.section
      initial={{ opacity: 0, scale: 0.985 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="relative min-h-[560px] overflow-hidden rounded-2xl bg-black"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(51,65,85,0.4),_rgba(0,0,0,0.95)_70%)]" />

      <div className="relative z-10 flex min-h-[560px] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-flex items-center rounded-full border border-red-400/60 bg-red-500/15 px-4 py-1 text-sm font-semibold tracking-[0.2em] text-red-300">
            {isLive ? 'LIVE' : 'READY'}
          </div>
          <p className="text-sm text-slate-300">
            {playUrl ? `推流地址：${playUrl}` : '视频流播放占位区域'}
          </p>
        </div>
      </div>

      <div className="absolute bottom-5 left-5 rounded-xl border border-white/15 bg-black/45 px-4 py-3 backdrop-blur-sm">
        <p className="max-w-[500px] truncate text-lg font-semibold text-white">{title}</p>
        <p className="mt-1 text-sm text-slate-300">
          主播：{hostName} · 分类：{category}
        </p>
      </div>
    </motion.section>
  )
}

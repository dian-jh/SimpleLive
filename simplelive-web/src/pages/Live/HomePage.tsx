import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Sparkles, TrendingUp, Gamepad2, Mic, MonitorPlay, Music, Code, Compass } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { StreamCard } from '@/features/Live/components/StreamCard'
import { useRoomList } from '@/features/Live/hooks/useRoomList'
import { useUserStore } from '@/store/User/useUserStore'

const CATEGORIES = [
  { id: 'all', label: '推荐', icon: Sparkles },
  { id: 'hot', label: '热门', icon: TrendingUp },
  { id: 'gaming', label: '游戏', icon: Gamepad2 },
  { id: 'chat', label: '颜值', icon: Mic },
  { id: 'tech', label: '科技', icon: Code },
  { id: 'music', label: "音乐", icon: Music },
  { id: 'outdoor', label: '户外', icon: Compass },
  { id: 'pc', label: '端游', icon: MonitorPlay },
]

const SKELETON_KEYS = Array.from({ length: 10 }, (_, index) => `skeleton-${index}`)

const HomePage = () => {
  const navigate = useNavigate()
  const token = useUserStore((state) => state.token)

  const { rooms, isLoading, error } = useRoomList({
    pageIndex: 1,
    pageSize: 20,
  })

  const handleGoStart = () => {
    if (!token) {
      alert('您目前暂未登录，请先登录后再开播！')
      navigate('/auth')
      return
    }
    navigate('/live/start', {
      state: { source: 'home-start', title: '新主播第一次直播很紧张！！！', category: '主机游戏' }
    })
  }

  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      <Navbar onStartLive={handleGoStart} />

      {/* 💡 核心修复：pt-24 给 Navbar 留出空间 */}
      <main className="mx-auto w-full max-w-[1600px] px-6 pb-12 pt-24">
        {error ? (
          <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
            {error}
          </div>
        ) : null}

        {/* 分类栏 (参照原型) */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 flex items-center gap-3 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden"
        >
          {CATEGORIES.map((cat, idx) => (
            <button
              key={cat.id}
              className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-[14px] font-medium transition-all duration-300 whitespace-nowrap
                ${idx === 0
                  ? "bg-slate-900 text-white shadow-md shadow-slate-900/20"
                  : "border border-slate-200/60 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }
              `}
            >
              <cat.icon className="h-4 w-4" />
              {cat.label}
            </button>
          ))}
        </motion.div>

        {/* 瀑布流网格 (参照原型间距) */}
        <section className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {isLoading
            ? SKELETON_KEYS.map((key) => (
              <div key={key} className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
                <div className="aspect-[16/10] animate-pulse bg-slate-100" />
                <div className="space-y-3 px-4 py-4">
                  <div className="h-4 w-4/5 animate-pulse rounded bg-slate-100" />
                  <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" />
                </div>
              </div>
            ))
            : rooms.map((room, index) => (
              <motion.div
                key={room.roomNumber}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.04 }}
              >
                <StreamCard room={room} />
              </motion.div>
            ))}
        </section>
      </main>
    </div>
  )
}

export default HomePage
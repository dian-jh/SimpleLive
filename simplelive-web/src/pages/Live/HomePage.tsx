import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Navbar } from '@/components/layout/Navbar'
import { StreamCard } from '@/features/Live/components/StreamCard'
import { useRoomList } from '@/features/Live/hooks/useRoomList'

const CATEGORY_OPTIONS = ['主机游戏', '热门手游', '科技编程', '音乐现场', '户外生活']
const SKELETON_KEYS = Array.from({ length: 8 }, (_, index) => `skeleton-${index}`)

interface StartLiveRouteState {
  source: 'home-start'
  title: string
  category: string
}

const HomePage = () => {
  const navigate = useNavigate()
  const { rooms, isLoading, error } = useRoomList({
    pageIndex: 1,
    pageSize: 20,
  })

  const [title, setTitle] = useState('新主播第一次直播很紧张！！！')
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0])

  const canStart = title.trim().length > 0

  const fallbackCoverUrl = useMemo(
    () => 'https://images.unsplash.com/photo-1598550487031-0898b4852123?auto=format&fit=crop&w=1200&q=80',
    [],
  )

  const handleGoStart = () => {
    if (!canStart) {
      return
    }

    // 教学点：通过 Router state 传递“开播草稿”，数据只在前端路由内存里流动，不暴露在 URL。
    // 这和后端里把临时对象放在服务层上下文，而不是拼到公开路由参数，是同一个“最小暴露面”思路。
    const startState: StartLiveRouteState = {
      source: 'home-start',
      title: title.trim(),
      category,
    }

    navigate('/live/start', { state: startState })
  }

  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      <Navbar onStartLive={handleGoStart} />

      <motion.main
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mx-auto w-full max-w-[1600px] px-6 pb-10 pt-6"
      >

        {error ? (
          <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
            {error}
          </div>
        ) : null}

        <section className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-5">
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
                key={room.RoomNumber}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.04 }}
              >
                <StreamCard room={room} />
              </motion.div>
            ))}
        </section>
      </motion.main>
    </div>
  )
}

export default HomePage

import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { Navbar } from '@/components/layout/Navbar'
import { ChatPanel } from '@/features/Live/components/ChatPanel'
import { VideoPlayer } from '@/features/Live/components/VideoPlayer'
import { useLiveRoom } from '@/features/Live/hooks/useLiveRoom'
import { StartLiveFlow } from '@/pages/Live/StartLiveFlow'

interface StartLiveRouteState {
  source: 'home-start'
  title: string
  category: string
}

const LiveRoomPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { roomNumber } = useParams<{ roomNumber: string }>()

  const isStartFlow = location.pathname === '/live/start'
  const viewerRoomNumber = isStartFlow ? undefined : roomNumber
  const { roomDetail, onlineCount, isLoading, isConnecting, error } = useLiveRoom(viewerRoomNumber)

  const startState = (location.state ?? null) as StartLiveRouteState | null
  const startTitle = startState?.title ?? '新主播第一次直播很紧张！！！'
  const startCategory = startState?.category ?? '主机游戏'

  if (isStartFlow) {
    return (
      <StartLiveFlow
        startTitle={startTitle}
        startCategory={startCategory}
      />
    )
  }

  // 兜底头像
  const avatarUrl = roomDetail?.hostAvatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=fallback'

  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      <Navbar onStartLive={() => navigate('/live/start')} />

      {/* 💡 核心修复：pt-24 抵消 Navbar 高度 */}
      <main className="mx-auto w-full max-w-[1600px] px-6 pb-10 pt-24">

        {/* 精美的原型级房间头部 */}
        <div className="mb-6 flex items-start gap-5 rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
          <img
            src={avatarUrl}
            alt={roomDetail?.hostUserName}
            className="h-16 w-16 shrink-0 rounded-full object-cover border border-slate-100"
          />
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-[22px] font-bold text-slate-900 leading-none">
                {roomDetail?.title ?? '直播间加载中...'}
              </h1>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                {roomDetail?.categoryId === 1 ? '主机游戏' : '娱乐'}
              </span>
            </div>

            <div className="mt-3 flex items-center gap-4 text-[14px] text-slate-500">
              <span className="font-medium text-slate-700">主播：{roomDetail?.hostUserName ?? '--'}</span>
              <span className="h-1 w-1 rounded-full bg-slate-300"></span>
              <span>房间号：{roomDetail?.roomNumber ?? '--'}</span>
              <span className="h-1 w-1 rounded-full bg-slate-300"></span>
              <span className="text-emerald-600 font-medium">
                {isConnecting ? '连接中...' : `${(onlineCount ?? 0).toLocaleString()} 人在看`}
              </span>
            </div>
          </div>

          <button className="rounded-full bg-slate-900 px-6 py-2 text-sm font-semibold text-white transition-all hover:bg-slate-800 hover:-translate-y-0.5">
            + 关注
          </button>
        </div>

        {error ? (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-500">
            {error}
          </div>
        ) : null}

        {/* 播放器与弹幕容器 */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
          {isLoading ? (
            <div className="min-h-[600px] animate-pulse rounded-2xl bg-slate-200" />
          ) : (
            <VideoPlayer
              title={roomDetail?.title ?? '直播间'}
              category={`分类 ${roomDetail?.categoryId ?? '-'}`}
              hostName={roomDetail?.hostUserName ?? '主播'}
              playUrl={roomDetail?.playUrl}
              isLive
            />
          )}
          {/* 这里如果觉得侧边栏也遮挡，可以在 ChatPanel 内部调整自身样式，但当前 grid 布局已通过 gap-6 隔开 */}
          <ChatPanel onlineCount={onlineCount} />
        </div>
      </main>
    </div>
  )
}

export default LiveRoomPage
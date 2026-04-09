import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { Radio, Tv, AlertCircle, Eye, EyeOff, Edit3, Users } from 'lucide-react' // 新增了 Edit3 和 Users 图标
import { Navbar } from '@/components/layout/Navbar'
import { ChatPanel } from '@/features/Live/components/ChatPanel'
import { VideoPlayer } from '@/features/Live/components/VideoPlayer'
import { useLiveRoom } from '@/features/Live/hooks/useLiveRoom'

type StartStep = 'choose' | 'obs' | 'live'
type StreamType = 'quick' | 'obs'

interface StartLiveRouteState {
  source: 'home-start'
  title: string
  category: string
}

const maskKey = (value: string) => {
  if (value.length < 6) {
    return '******'
  }
  return `${'*'.repeat(value.length - 4)}${value.slice(-4)}`
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

  const [step, setStep] = useState<StartStep>('choose')
  const [selectedType, setSelectedType] = useState<StreamType>('obs')
  const [hostOnlineCount, setHostOnlineCount] = useState(0)

  // 控制推流码/地址显示的 UI 状态
  const [showPushUrl, setShowPushUrl] = useState(false)
  const [showStreamKey, setShowStreamKey] = useState(false)

  // ================= 新增：标题内联编辑状态 =================
  const [editableTitle, setEditableTitle] = useState(startTitle)
  const [isEditingTitle, setIsEditingTitle] = useState(false)

  const obsConfig = useMemo(
    () => ({
      pushUrl: 'rtmp://push.simplelive.local/live',
      streamKey: `slive_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    }),
    [],
  )

  useEffect(() => {
    if (!isStartFlow) return
    if (step !== 'live') return

    const timer = window.setInterval(() => {
      setHostOnlineCount((prev) => prev + Math.floor(Math.random() * 3))
    }, 4000)

    return () => window.clearInterval(timer)
  }, [isStartFlow, step])

  const copyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      alert('已复制到剪贴板')
    } catch (clipboardError) {
      console.error('复制失败', clipboardError)
      alert('复制失败，请手动复制')
    }
  }

  const handleNextStep = () => {
    if (selectedType === 'quick') {
      alert('极速开播模式暂未接入，本次请选择第三方推流（OBS）')
      return
    }
    setStep('obs')
  }

  const handleStartLive = () => {
    setHostOnlineCount(1)
    setStep('live')
  }

  const handleEndLive = () => {
    navigate('/live')
  }

  if (isStartFlow) {
    return (
      <div className="min-h-screen bg-[#f5f7fb] overflow-x-hidden">
        {/* ================= 第一阶段：选择开播类型 ================= */}
        {step === 'choose' ? (
          <main className="relative flex min-h-screen flex-col items-center justify-center px-6 overflow-hidden">
            <div className="pointer-events-none absolute left-1/2 top-1/2 z-0 -translate-x-1/2 -translate-y-1/2 select-none whitespace-nowrap text-[20vw] font-black tracking-tighter text-slate-200/40">
              Go Live
            </div>

            <motion.section
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative z-10 flex w-full max-w-[800px] flex-col items-center rounded-[40px] bg-white/60 backdrop-blur-xl px-10 py-16 text-center shadow-sm"
            >
              <h1 className="mb-16 text-[32px] font-bold tracking-tight text-slate-900">选择开播类型</h1>

              <div className="mb-20 flex items-center gap-10 md:gap-16">
                <button
                  type="button"
                  onClick={() => setSelectedType('quick')}
                  className={`group flex flex-col items-center gap-4 transition-all duration-300 ${selectedType === 'quick' ? 'scale-105' : 'hover:scale-105'}`}
                >
                  <div className={`flex h-32 w-32 items-center justify-center rounded-full border-[1.5px] transition-all duration-300 ${selectedType === 'quick' ? 'border-slate-900 bg-slate-900 text-white shadow-lg shadow-slate-900/20' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:shadow-md'}`}>
                    <Radio className="h-10 w-10" />
                  </div>
                  <span className={`text-[16px] font-medium transition-colors ${selectedType === 'quick' ? 'text-slate-900' : 'text-slate-600 group-hover:text-slate-900'}`}>极速开播</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedType('obs')}
                  className={`group flex flex-col items-center gap-4 transition-all duration-300 ${selectedType === 'obs' ? 'scale-105' : 'hover:scale-105'}`}
                >
                  <div className={`flex h-32 w-32 items-center justify-center rounded-full border-[1.5px] transition-all duration-300 ${selectedType === 'obs' ? 'border-slate-900 bg-slate-900 text-white shadow-lg shadow-slate-900/20' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:shadow-md'}`}>
                    <Tv className="h-10 w-10" />
                  </div>
                  <span className={`text-[16px] font-medium transition-colors ${selectedType === 'obs' ? 'text-slate-900' : 'text-slate-600 group-hover:text-slate-900'}`}>第三方推流</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleNextStep}
                disabled={!selectedType}
                className={`rounded-full px-32 py-4 text-[18px] font-medium transition-all duration-300 ${selectedType ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20 hover:-translate-y-1 hover:bg-slate-800' : 'cursor-not-allowed bg-slate-100 text-slate-400'}`}
              >
                下一步
              </button>

              <button
                type="button"
                onClick={() => navigate('/live')}
                className="mt-8 text-[15px] font-medium text-slate-500 transition-colors hover:text-slate-900"
              >
                返回首页
              </button>
            </motion.section>
          </main>
        ) : null}

        {/* ================= 第二阶段：推流设置 ================= */}
        {step === 'obs' ? (
          <main className="mx-auto grid w-full max-w-[1600px] grid-cols-1 gap-0 px-6 pb-0 pt-4 lg:grid-cols-[1fr_330px]">
            <section className="flex flex-col min-h-[calc(100vh-140px)] bg-[#f6f8fc]">

              {/* ================= 重构的 Header (仿虎牙控制台布局) ================= */}
              <div className="border-b border-slate-200/60 bg-white px-8 py-5">
                <div className="flex flex-col gap-3">

                  {/* 第一行：分类徽章 + 标题编辑区 */}
                  <div className="flex items-center gap-3">
                    <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-[13px] font-medium text-slate-700">
                      {startCategory}
                    </span>

                    {isEditingTitle ? (
                      <div className="flex flex-1 items-center gap-2">
                        <input
                          // eslint-disable-next-line jsx-a11y/no-autofocus
                          autoFocus
                          type="text"
                          value={editableTitle}
                          onChange={(e) => setEditableTitle(e.target.value)}
                          onBlur={() => setIsEditingTitle(false)}
                          onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
                          className="h-8 w-full max-w-[400px] rounded-md border border-slate-300 px-2 text-[18px] font-bold text-slate-900 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                        />
                        <button
                          onClick={() => setIsEditingTitle(false)}
                          className="text-sm font-medium text-blue-500 hover:text-blue-600"
                        >
                          保存
                        </button>
                      </div>
                    ) : (
                      <div
                        className="group flex cursor-pointer items-center gap-2"
                        onClick={() => setIsEditingTitle(true)}
                        title="点击修改标题"
                      >
                        <h1 className="text-[20px] font-bold text-slate-900 transition-colors group-hover:text-amber-500">
                          {editableTitle}
                        </h1>
                        <Edit3 className="h-4 w-4 text-slate-400 opacity-0 transition-opacity group-hover:opacity-100" />
                      </div>
                    )}
                  </div>

                  {/* 第二行：主播名字、房间号、观众人数等 Meta 信息 */}
                  <div className="flex items-center gap-6 pl-1 text-[13px] text-slate-500">
                    <span className="font-medium text-slate-700">
                      主播：{roomDetail?.HostUserName ?? '当前主播'}
                    </span>
                    <span>
                      房间号：{roomDetail?.RoomNumber ?? '获取中...'}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <Users className="h-4 w-4" />
                      <span>观众：{hostOnlineCount}</span>
                    </div>
                  </div>

                </div>
              </div>

              {/* Center Content */}
              <div className="flex flex-1 items-center justify-center p-8">
                <div className="w-full max-w-[560px] rounded-[28px] border border-slate-100/80 bg-white p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                  <div className="mb-8 flex items-center gap-2 rounded-xl bg-rose-50 px-4 py-3 text-rose-500">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span className="text-[13px] font-medium">推流码是您的开播凭证，请勿泄露给他人。</span>
                  </div>

                  <div className="space-y-6">
                    {/* Push URL */}
                    <div className="flex items-center gap-4">
                      <label className="w-16 shrink-0 text-right text-[14px] font-semibold text-slate-600">推流地址</label>
                      <div className="group flex flex-1 items-stretch overflow-hidden rounded-xl border border-slate-200 bg-slate-50 transition-colors hover:border-slate-300">
                        <input
                          type={showPushUrl ? "text" : "password"}
                          readOnly
                          value={showPushUrl ? obsConfig.pushUrl : maskKey(obsConfig.pushUrl)}
                          className="flex-1 bg-transparent px-4 py-3 text-[14px] text-slate-700 outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPushUrl(!showPushUrl)}
                          className="flex items-center justify-center bg-slate-50 px-3 text-slate-400 transition-colors hover:text-slate-600"
                        >
                          {showPushUrl ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </button>
                        <button onClick={() => copyText(obsConfig.pushUrl)} className="flex items-center justify-center bg-amber-400 px-6 text-[14px] font-bold text-white transition-colors hover:bg-amber-500">
                          复制
                        </button>
                      </div>
                    </div>

                    {/* Stream Key */}
                    <div className="flex items-center gap-4">
                      <label className="w-16 shrink-0 text-right text-[14px] font-semibold text-slate-600">直播码</label>
                      <div className="group flex flex-1 items-stretch overflow-hidden rounded-xl border border-slate-200 bg-slate-50 transition-colors hover:border-slate-300">
                        <input
                          type={showStreamKey ? "text" : "password"}
                          readOnly
                          value={showStreamKey ? obsConfig.streamKey : maskKey(obsConfig.streamKey)}
                          className="flex-1 bg-transparent px-4 py-3 text-[14px] text-slate-700 outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowStreamKey(!showStreamKey)}
                          className="flex items-center justify-center bg-slate-50 px-3 text-slate-400 transition-colors hover:text-slate-600"
                        >
                          {showStreamKey ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </button>
                        <button onClick={() => copyText(obsConfig.streamKey)} className="flex items-center justify-center bg-amber-400 px-6 text-[14px] font-bold text-white transition-colors hover:bg-amber-500">
                          复制
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Bar */}
              <div className="flex h-[80px] shrink-0 items-center justify-end gap-4 border-t border-slate-100/60 bg-white px-8">
                <button
                  type="button"
                  onClick={() => setStep('choose')}
                  className="rounded-full border border-slate-200 px-8 py-2.5 text-[15px] font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                >
                  返回
                </button>
                <button
                  type="button"
                  onClick={handleStartLive}
                  className="rounded-full bg-amber-400 px-10 py-2.5 text-[15px] font-bold text-slate-900 shadow-sm transition-all hover:bg-amber-500 hover:shadow-md"
                >
                  开始直播
                </button>
              </div>
            </section>

            <ChatPanel onlineCount={hostOnlineCount} placeholderOnly />
          </main>
        ) : null}

        {/* ================= 第三阶段：直播中 ================= */}
        {step === 'live' ? (
          <main className="mx-auto grid w-full max-w-[1600px] grid-cols-1 gap-0 px-6 pb-6 pt-4 lg:grid-cols-[1fr_330px]">
            <section className="space-y-4">
              <div className="flex items-center justify-between rounded-2xl bg-white px-5 py-4">
                <div>
                  <p className="text-sm text-slate-500">{startCategory}</p>
                  {/* 同步使用已修改的 editableTitle */}
                  <h2 className="text-3xl font-black text-slate-900">{editableTitle}</h2>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-500">在线人数</p>
                  <p className="text-2xl font-black text-emerald-600">{hostOnlineCount}</p>
                </div>
              </div>
              {/* 播放器同步使用已修改的标题 */}
              <VideoPlayer title={editableTitle} category={startCategory} hostName="我自己" isLive />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleEndLive}
                  className="rounded-full bg-rose-500 px-8 py-3 text-lg font-bold text-white hover:bg-rose-600"
                >
                  结束直播
                </button>
              </div>
            </section>
            <ChatPanel onlineCount={hostOnlineCount} />
          </main>
        ) : null}
      </div>
    )
  }

  // ================= 观众端渲染逻辑 =================
  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      <Navbar onStartLive={() => navigate('/live/start')} />
      <main className="mx-auto w-full max-w-[1600px] px-6 pb-6 pt-4">
        <div className="mb-4 flex items-center justify-between rounded-2xl bg-white px-5 py-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900">{roomDetail?.Title ?? '直播间加载中...'}</h1>
            <p className="mt-1 text-sm text-slate-500">
              主播：{roomDetail?.HostUserName ?? '--'} · 房间号：{roomDetail?.RoomNumber ?? '--'}
            </p>
          </div>
          <p className="text-sm font-semibold text-slate-600">
            {isConnecting ? '实时连接中...' : `${onlineCount} 人在线`}
          </p>
        </div>
        {error ? (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-500">
            {error}
          </div>
        ) : null}
        <div className="grid grid-cols-1 gap-0 lg:grid-cols-[1fr_330px]">
          {isLoading ? (
            <div className="min-h-[560px] animate-pulse rounded-2xl bg-slate-200" />
          ) : (
            <VideoPlayer
              title={roomDetail?.Title ?? '直播间'}
              category={`分类 ${roomDetail?.CategoryId ?? '-'}`}
              hostName={roomDetail?.HostUserName ?? '主播'}
              playUrl={roomDetail?.PlayUrl}
              isLive
            />
          )}
          <ChatPanel onlineCount={onlineCount} />
        </div>
      </main>
    </div>
  )
}

export default LiveRoomPage
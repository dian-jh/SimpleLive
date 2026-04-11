import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Radio, Tv, AlertCircle, Eye, EyeOff, Edit3, Users, Loader2 } from 'lucide-react'
import { ChatPanel } from '@/features/Live/components/ChatPanel'
import { prepareLiveRoom, applyLiveSettings, type PrepareLiveResponse } from '@/api/Live/roomApi'
import { useUserStore } from '@/store/User/useUserStore'

type StartStep = 'choose' | 'obs'
type StreamType = 'quick' | 'obs'

interface StartLiveFlowProps {
  startTitle: string
  startCategory: string
}

const PUSH_URL = 'rtmp://localhost:1935/live/'

const maskKey = (value: string) => {
  if (value.length < 6) {
    return '******'
  }
  return `${'*'.repeat(value.length - 4)}${value.slice(-4)}`
}

export const StartLiveFlow = ({
  startTitle,
  startCategory,
}: StartLiveFlowProps) => {
  const navigate = useNavigate()

  // ================= 1. 登录鉴权拦截 =================
  const token = useUserStore((state) => state.token)

  //StrictMode会导致 useEffect 执行两次，开发环境下可能会看到两个连续的 alert。
  // 我们可以用一个 ref 来标记是否已经弹过警告，确保用户只看到一次提示框。
  // 生产环境中 StrictMode 不会重复执行 useEffect，所以不会有这个问题。
  // 💡 声明一个“是否已经警告过”的标记，初始为 false
  const hasAlerted = useRef(false)

  useEffect(() => {
    // 只有在没 token 且 还没警告过 的情况下才弹窗
    if (!token && !hasAlerted.current) {
      hasAlerted.current = true // 🔒 立刻上锁
      alert('您目前暂未登录，请先登录后再尝试开播！')
      navigate('/auth', { replace: true })
    }
  }, [token, navigate])

  // ================= 状态管理 =================
  const [step, setStep] = useState<StartStep>('choose')
  const [selectedType, setSelectedType] = useState<StreamType>('obs')
  const [showPushUrl, setShowPushUrl] = useState(false)
  const [showStreamKey, setShowStreamKey] = useState(false)
  const [editableTitle, setEditableTitle] = useState(startTitle)
  const [isEditingTitle, setIsEditingTitle] = useState(false)

  // API 交互状态
  const [isPreparing, setIsPreparing] = useState(false)
  const [isApplying, setIsApplying] = useState(false)
  const [liveConfig, setLiveConfig] = useState<PrepareLiveResponse | null>(null)
  const [isLiveStarted, setIsLiveStarted] = useState(false)

  const copyText = async (text: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text)
      alert('已复制到剪贴板')
    } catch (clipboardError) {
      console.error('复制失败', clipboardError)
      alert('复制失败，请手动复制')
    }
  }

  // ================= 2. 获取开播信息 (Prepare) =================
  const handleNextStep = async () => {
    if (selectedType === 'quick') {
      alert('极速开播模式暂未接入，本次请选择第三方推流（OBS）')
      return
    }

    setIsPreparing(true)
    try {
      // 触发 C# 的 Prepare 接口，预生成推流码
      const response = await prepareLiveRoom()
      setLiveConfig(response)
      // 如果后端有上一次的标题，回显填入输入框
      if (response.title) {
        setEditableTitle(response.title)
      }
      setStep('obs')
    } catch (error) {
      // 这里的 error 会被全局 axios 拦截器处理提取 Message
      alert('获取开播信息失败，请检查后端服务是否运行。错误信息: ' + error)
    } finally {
      setIsPreparing(false)
    }
  }

  // ================= 3. 保存开播设置 (Apply) =================
  const handleStartLive = async () => {
    setIsApplying(true)
    try {
      // 触发 C# 的 Apply 接口，保存用户填写的标题等
      await applyLiveSettings({
        CategoryId: 1, // 实际开发可从下拉框获取对应的 int ID
        Title: editableTitle,
      })

      setIsLiveStarted(true)
      alert('✅ 直播设置保存成功！\n\n请将左侧的【推流地址】和【直播码】复制到 OBS 中并点击“开始推流”。您的直播间现已准备就绪。')
    } catch (error) {
      alert('保存设置失败: ' + error)
    } finally {
      setIsApplying(false)
    }
  }

  // 如果未登录，直接返回空，防止页面闪烁（useEffect会处理跳转）
  if (!token) return null;

  return (
    <div className="min-h-screen bg-[#f5f7fb] overflow-x-hidden">
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
              disabled={!selectedType || isPreparing}
              className={`flex items-center justify-center rounded-full px-32 py-4 text-[18px] font-medium transition-all duration-300 ${selectedType ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20 hover:-translate-y-1 hover:bg-slate-800' : 'cursor-not-allowed bg-slate-100 text-slate-400'}`}
            >
              {isPreparing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
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

      {step === 'obs' ? (
        <main className="mx-auto grid w-full max-w-[1600px] grid-cols-1 gap-0 px-6 pb-0 pt-4 lg:grid-cols-[1fr_330px]">
          <section className="flex flex-col min-h-[calc(100vh-140px)] bg-[#f6f8fc]">
            <div className="border-b border-slate-200/60 bg-white px-8 py-5">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-[13px] font-medium text-slate-700">
                    {startCategory}
                  </span>

                  {isEditingTitle ? (
                    <div className="flex flex-1 items-center gap-2">
                      <input
                        autoFocus
                        type="text"
                        value={editableTitle}
                        onChange={(event) => setEditableTitle(event.target.value)}
                        onBlur={() => setIsEditingTitle(false)}
                        onKeyDown={(event) => event.key === 'Enter' && setIsEditingTitle(false)}
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

                <div className="flex items-center gap-6 pl-1 text-[13px] text-slate-500">
                  <span className="font-medium text-slate-700">
                    主播：我的直播间
                  </span>
                  <span>房间号：{liveConfig?.roomNumber ?? '获取失败'}</span>
                  <div className="flex items-center gap-1.5">
                    <Users className="h-4 w-4" />
                    <span>观众：{isLiveStarted ? '0 (等待推流)' : '0'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-1 items-center justify-center p-8">
              <div className="w-full max-w-[560px] rounded-[28px] border border-slate-100/80 bg-white p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <div className="mb-8 flex items-center gap-2 rounded-xl bg-rose-50 px-4 py-3 text-rose-500">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span className="text-[13px] font-medium">推流码是您的开播凭证，请勿泄露给他人。</span>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <label className="w-16 shrink-0 text-right text-[14px] font-semibold text-slate-600">推流地址</label>
                    <div className="group flex flex-1 items-stretch overflow-hidden rounded-xl border border-slate-200 bg-slate-50 transition-colors hover:border-slate-300">
                      <input
                        type={showPushUrl ? 'text' : 'password'}
                        readOnly
                        value={showPushUrl ? PUSH_URL : maskKey(PUSH_URL)}
                        className="flex-1 bg-transparent px-4 py-3 text-[14px] text-slate-700 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPushUrl(!showPushUrl)}
                        className="flex items-center justify-center bg-slate-50 px-3 text-slate-400 transition-colors hover:text-slate-600"
                      >
                        {showPushUrl ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </button>
                      <button onClick={() => copyText(PUSH_URL)} className="flex items-center justify-center bg-amber-400 px-6 text-[14px] font-bold text-white transition-colors hover:bg-amber-500">
                        复制
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <label className="w-16 shrink-0 text-right text-[14px] font-semibold text-slate-600">直播码</label>
                    <div className="group flex flex-1 items-stretch overflow-hidden rounded-xl border border-slate-200 bg-slate-50 transition-colors hover:border-slate-300">
                      <input
                        type={showStreamKey ? 'text' : 'password'}
                        readOnly
                        value={showStreamKey ? (liveConfig?.streamKey ?? '') : maskKey(liveConfig?.streamKey ?? '******')}
                        className="flex-1 bg-transparent px-4 py-3 text-[14px] text-slate-700 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowStreamKey(!showStreamKey)}
                        className="flex items-center justify-center bg-slate-50 px-3 text-slate-400 transition-colors hover:text-slate-600"
                      >
                        {showStreamKey ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </button>
                      <button onClick={() => copyText(liveConfig?.streamKey ?? '')} className="flex items-center justify-center bg-amber-400 px-6 text-[14px] font-bold text-white transition-colors hover:bg-amber-500">
                        复制
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex h-[80px] shrink-0 items-center justify-end gap-4 border-t border-slate-100/60 bg-white px-8">
              <button
                type="button"
                onClick={() => setStep('choose')}
                className="rounded-full border border-slate-200 px-8 py-2.5 text-[15px] font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
              >
                返回
              </button>
              {isLiveStarted ? (
                <button
                  type="button"
                  disabled
                  className="rounded-full bg-emerald-100 px-10 py-2.5 text-[15px] font-bold text-emerald-600 shadow-sm transition-all"
                >
                  等待 OBS 推流中...
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStartLive}
                  disabled={isApplying}
                  className="flex items-center justify-center rounded-full bg-amber-400 px-10 py-2.5 text-[15px] font-bold text-slate-900 shadow-sm transition-all hover:bg-amber-500 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isApplying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  开始直播
                </button>
              )}
            </div>
          </section>

          <ChatPanel onlineCount={0} placeholderOnly />
        </main>
      ) : null}
    </div>
  )
}
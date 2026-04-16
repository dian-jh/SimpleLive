import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import type { ChatMessage } from '../hooks/useLiveRoom' // 引入我们在 hook 中定义的类型

interface ChatPanelProps {
  onlineCount: number
  messages: ChatMessage[]
  onSendMessage: (content: string) => Promise<void>
  placeholderOnly?: boolean
}

export const ChatPanel = ({ onlineCount, messages, onSendMessage, placeholderOnly = false }: ChatPanelProps) => {
  const [draft, setDraft] = useState('')
  const [isSending, setIsSending] = useState(false)
  const listRef = useRef<HTMLUListElement>(null)

  // 💡 教学点：智能自动滚动算法
  // 我们不能一有新消息就无脑滚到底部，如果用户正在往上翻看聊天记录，突然被拉下去会非常愤怒。
  useEffect(() => {
    if (!listRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = listRef.current

    // 判断用户当前滚动条距离底部的距离。如果小于 150px，说明他停留在底部附近，允许自动滚动。
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 150

    // 如果消息很少（刚进房间），或者用户就在底部，触发平滑滚动
    if (isAtBottom || messages.length <= 2) {
      listRef.current.scrollTo({
        top: listRef.current.scrollHeight,
        behavior: 'smooth',
      })
    }
  }, [messages])

  const handleSend = async () => {
    const text = draft.trim()
    if (!text || isSending) return

    setIsSending(true)
    try {
      // 💡 调用父组件传进来的 SignalR 发送方法
      await onSendMessage(text)
      setDraft('') // 发送成功后清空输入框
    } catch (err: any) {
      alert('发送失败：' + (err.message || '网络错误'))
    } finally {
      setIsSending(false)
    }
  }

  return (
    <aside className="flex h-full min-h-[560px] flex-col overflow-hidden border-l border-slate-200 bg-white">
      <header className="border-b border-slate-100 px-6 py-5 bg-slate-50/50">
        <h2 className="text-[20px] font-bold text-slate-900 tracking-tight">直播互动</h2>
        <div className="flex items-center gap-2 mt-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <p className="text-[13px] text-slate-500 font-medium">{(onlineCount ?? 0).toLocaleString()} 人正在看</p>
        </div>
      </header>

      {placeholderOnly ? (
        <div className="flex flex-1 items-center justify-center px-6 text-center text-[18px] font-bold text-slate-200">
          等待连接...
        </div>
      ) : (
        <ul ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4 scrollbar-thin scrollbar-thumb-slate-200">
          <AnimatePresence initial={false}>
            {messages.map((msg, index) => {
              // 系统消息特殊样式
              const isSystem = msg.userId === 'system'
              return (
                <motion.li
                  key={`${msg.sendTime}-${index}`} // 组合 Key 防止重复
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-[13px] leading-relaxed break-words"
                >
                  <span className={`font-bold mr-2 ${isSystem ? 'text-rose-500' : 'text-slate-500'}`}>
                    {msg.userName}:
                  </span>
                  <span className={isSystem ? 'text-rose-400' : 'text-slate-800'}>
                    {msg.message}
                  </span>
                </motion.li>
              )
            })}
            {messages.length === 0 && (
              <div className="text-center text-slate-400 text-xs mt-10">暂无弹幕，快来抢沙发吧~</div>
            )}
          </AnimatePresence>
        </ul>
      )}

      <div className="border-t border-slate-100 p-4 bg-white">
        <div className="flex items-center gap-2 bg-slate-100 rounded-xl p-1.5 focus-within:bg-white focus-within:ring-2 focus-within:ring-slate-900 transition-all">
          <input
            value={draft}
            disabled={isSending || placeholderOnly}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            maxLength={100} // 与后端截断长度保持一致
            placeholder="吐个槽吧..."
            className="flex-1 bg-transparent px-3 py-1.5 text-[14px] text-slate-900 outline-none border-none placeholder:text-slate-400"
          />
          <button
            onClick={handleSend}
            disabled={!draft.trim() || isSending || placeholderOnly}
            className="flex items-center justify-center bg-slate-900 text-white px-5 py-2 rounded-lg text-[13px] font-bold hover:bg-slate-800 disabled:opacity-40 transition-all active:scale-95"
          >
            {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : '发送'}
          </button>
        </div>
      </div>
    </aside>
  )
}
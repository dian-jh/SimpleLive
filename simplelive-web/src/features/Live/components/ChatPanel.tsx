import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

interface ChatPanelProps {
  onlineCount: number
  placeholderOnly?: boolean
}

type MessageTone = 'system' | 'fan' | 'guest' | 'self'

interface ChatMessage {
  id: string
  sender: string
  content: string
  tone: MessageTone
}

const INITIAL_MESSAGES: ChatMessage[] = [
  { id: 'msg-1', sender: '系统', content: '欢迎来到直播间，请大家文明发言。', tone: 'system' },
  { id: 'msg-2', sender: '老粉丝', content: '第一第一第一！', tone: 'fan' },
  { id: 'msg-3', sender: '路人甲', content: '主播今天玩什么游戏？', tone: 'guest' },
]

const TONE_CLASS_MAP: Record<MessageTone, string> = {
  system: 'text-slate-400',
  fan: 'text-blue-500',
  guest: 'text-emerald-500',
  self: 'text-indigo-500',
}

export const ChatPanel = ({ onlineCount, placeholderOnly = false }: ChatPanelProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES)
  const [draft, setDraft] = useState('')
  const listRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages])

  const handleSend = () => {
    const text = draft.trim()
    if (!text) {
      return
    }

    setMessages((prev) => [
      ...prev,
      {
        id: `self-${Date.now()}`,
        sender: '我',
        content: text,
        tone: 'self',
      },
    ])
    setDraft('')
  }

  return (
    <aside className="flex h-full min-h-[560px] flex-col overflow-hidden border-l border-slate-200 bg-white">
      <header className="border-b border-slate-100 px-6 py-6">
        <h2 className="text-[34px] font-extrabold text-slate-900 md:text-[28px]">直播间互动</h2>
        <p className="mt-1 text-sm text-slate-500">{onlineCount} 人在线</p>
      </header>

      {placeholderOnly ? (
        <div className="flex flex-1 items-center justify-center px-6 text-center text-[46px] font-black text-slate-200 md:text-[38px]">
          弹幕显示区域
        </div>
      ) : (
        <ul ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-6 py-4">
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <motion.li
                key={message.id}
                initial={{ opacity: 0, x: 12, y: 8 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="text-sm leading-6"
              >
                <span className={`mr-2 font-semibold ${TONE_CLASS_MAP[message.tone]}`}>
                  {message.sender}:
                </span>
                <span className="text-slate-700">{message.content}</span>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}

      <div className="border-t border-slate-100 p-4">
        <div className="flex gap-2">
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                handleSend()
              }
            }}
            maxLength={30}
            placeholder="发个弹幕吧"
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition-colors focus:border-slate-300 focus:bg-white"
          />
          <button
            type="button"
            onClick={handleSend}
            className="rounded-xl bg-slate-900 px-5 py-2 text-sm font-semibold text-white"
          >
            发送
          </button>
        </div>
      </div>
    </aside>
  )
}

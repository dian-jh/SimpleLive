import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import mpegts from 'mpegts.js'

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
  // 获取原生 video DOM 元素的引用
  const videoRef = useRef<HTMLVideoElement>(null)
  // 保存 mpegts 播放器实例，以便在组件卸载时销毁它
  const playerRef = useRef<mpegts.Player | null>(null)

  useEffect(() => {
    // 1. 如果没有拉流地址，或者浏览器不支持该技术，直接退出
    if (!playUrl || !mpegts.isSupported() || !videoRef.current) {
      return
    }

    // 2. 配置并创建播放器实例 (极致低延迟配置)
    const player = mpegts.createPlayer(
      {
        type: 'flv',       // 视频流类型
        isLive: true,      // 开启直播模式
        hasAudio: true,
        hasVideo: true,
        url: playUrl,      // 真实的拉流地址
      },
      {
        enableWorker: true,             // 开启多线程提升性能
        enableStashBuffer: false,       // 关键！关闭内部缓存，最大程度降低直播延迟
        stashInitialSize: 128,          // 减少初始缓存请求
        liveBufferLatencyChasing: true, // 开启追帧，防止延迟越堆越高
      }
    )

    // 3. 将播放器挂载到 <video> 标签上
    player.attachMediaElement(videoRef.current)
    player.load()

    // 4. 尝试自动播放
    // 💡 教学点：现代浏览器（Chrome/Edge）为了防止网页一打开就大呼小叫，
    // 强制规定：只要不是静音（muted），就不允许自动播放（play() 会报错）。
    // 所以我们在 <video> 标签上加了 muted 属性。观众进来后可以自己点开声音。
    const playPromise = player.play()
    // 判断返回值是否存在，并且是一个带有 catch 方法的 Promise
    if (playPromise !== undefined && typeof playPromise.catch === 'function') {
      playPromise.catch((err: unknown) => {
        console.warn('浏览器拦截了自动播放，需要用户手动触发:', err)
      })
    }

    playerRef.current = player

    // 5. 【极其重要】组件销毁时（比如切到其他页面），必须销毁播放器，否则会导致严重的内存泄漏
    return () => {
      if (playerRef.current) {
        playerRef.current.pause()
        playerRef.current.unload()
        playerRef.current.detachMediaElement()
        playerRef.current.destroy()
        playerRef.current = null
      }
    }
  }, [playUrl])

  return (
    <motion.section
      initial={{ opacity: 0, scale: 0.985 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="relative min-h-[560px] w-full overflow-hidden rounded-2xl bg-black"
    >
      {/* 视频容器 */}
      {playUrl ? (
        <video
          ref={videoRef}
          controls // 显示播放、暂停、全屏按钮
          muted    // 默认静音，以绕过浏览器自动播放限制
          autoPlay
          className="absolute inset-0 h-full w-full object-contain"
        />
      ) : (
        // 如果没有 playUrl，显示之前的占位图
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(51,65,85,0.4),_rgba(0,0,0,0.95)_70%)] flex flex-col items-center justify-center">
          <div className="mb-4 inline-flex items-center rounded-full border border-red-400/60 bg-red-500/15 px-4 py-1 text-sm font-semibold tracking-[0.2em] text-red-300">
            {isLive ? 'LIVE' : 'READY'}
          </div>
          <p className="text-sm text-slate-300">视频流未接入</p>
        </div>
      )}

      {/* 悬浮信息框 (UI 层叠在视频上方，指针事件穿透避免挡住全屏按钮) */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/80 to-transparent">
        <div className="pointer-events-auto inline-block rounded-xl border border-white/15 bg-black/45 px-4 py-3 backdrop-blur-sm">
          <p className="max-w-[500px] truncate text-lg font-semibold text-white">{title}</p>
          <p className="mt-1 text-sm text-slate-300">
            主播：{hostName} · 分类：{category}
          </p>
        </div>
      </div>
    </motion.section>
  )
}
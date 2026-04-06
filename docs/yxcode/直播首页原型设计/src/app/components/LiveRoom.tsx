import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router";
import { Play, Pause, RefreshCw, Volume2, VolumeX, Maximize, Minimize, Settings, MessageSquare, MonitorOff, User, Check } from "lucide-react";

export function LiveRoom() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showDanmaku, setShowDanmaku] = useState(true);
  const [isHoveringPlayer, setIsHoveringPlayer] = useState(false);
  const [isLive, setIsLive] = useState(false); // Mock stream state

  const playerRef = useRef<HTMLDivElement>(null);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      playerRef.current?.requestFullscreen();
      setIsFullScreen(true);
    } else {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#FDFDFE] flex flex-col p-6 max-w-[1600px] mx-auto gap-4">
      
      {/* Room Header */}
      <div className="bg-white rounded-2xl p-4 flex items-start gap-4 border border-slate-100/60 shadow-sm shrink-0">
        <div className="w-16 h-16 rounded-full overflow-hidden border border-slate-100 shrink-0">
          <img src="https://images.unsplash.com/photo-1611695434369-a8f5d76ceb7b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMG1hbiUyMHBvcnRyYWl0JTIwc21pbGV8ZW58MXx8fHwxNzc0NDk2NDM0fDA&ixlib=rb-4.1.0&q=80&w=200" alt="avatar" className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 flex flex-col justify-center gap-1.5">
          <div className="flex items-center gap-3">
            <h1 className="text-[20px] font-bold text-slate-900 leading-tight">新主播第一次直播很紧张！！！！</h1>
            <button className="flex items-center h-7 bg-slate-100 rounded-full text-[13px] font-medium text-slate-600 hover:bg-slate-200 transition-colors overflow-hidden">
              <div className="flex items-center gap-1 px-3 h-full">
                <Check className="w-3.5 h-3.5 text-slate-500" />
                <span>已关注</span>
              </div>
              <div className="px-3 h-full flex items-center border-l border-slate-200 text-slate-500">
                1.2万
              </div>
            </button>
          </div>
          <div className="flex items-center gap-4 text-[13px] text-slate-500">
            <span className="font-medium text-slate-700">主播：阿木木</span>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <span>房间号: 888888</span>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <span>观看: 1.2万</span>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <span className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600">主机游戏</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex gap-4 min-h-0">
        
        {/* Player Area */}
        <div 
          ref={playerRef}
          className={`flex-1 bg-black rounded-2xl overflow-hidden relative flex flex-col group ${isFullScreen ? 'rounded-none' : ''}`}
          onMouseEnter={() => setIsHoveringPlayer(true)}
          onMouseLeave={() => setIsHoveringPlayer(false)}
        >
          {/* Mock Video Content */}
          <div className="absolute inset-0 flex items-center justify-center">
            {isLive ? (
              <img src="https://images.unsplash.com/photo-1598550487031-0898b4852123?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlc3BvcnRzJTIwZ2FtaW5nJTIwc3RyZWFtfGVufDF8fHx8MTc3NDUyOTM2NHww&ixlib=rb-4.1.0&q=80&w=1920" alt="stream" className="w-full h-full object-cover opacity-90" />
            ) : (
              <div className="flex flex-col items-center gap-4 text-white/50">
                 <MonitorOff className="w-16 h-16" />
                 <h2 className="text-[24px] font-medium tracking-widest">主播当前未开播</h2>
                 <button onClick={() => setIsLive(true)} className="mt-4 px-4 py-2 border border-white/20 rounded-full text-[13px] hover:bg-white/10 transition-colors text-white/70">(模拟点击开播)</button>
              </div>
            )}
          </div>

          {/* Mock Danmaku Layer */}
          <AnimatePresence>
            {showDanmaku && isLive && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 pointer-events-none overflow-hidden"
              >
                <div className="absolute top-[10%] right-0 text-white font-medium text-[20px] drop-shadow-md whitespace-nowrap animate-[marquee_10s_linear_infinite]">欢迎来到直播间！</div>
                <div className="absolute top-[20%] right-0 text-white font-medium text-[18px] drop-shadow-md whitespace-nowrap animate-[marquee_8s_linear_infinite_1s]">这游戏太好玩了</div>
                <div className="absolute top-[15%] right-0 text-white font-medium text-[22px] drop-shadow-md whitespace-nowrap animate-[marquee_12s_linear_infinite_2s]">6666666</div>
                <div className="absolute top-[25%] right-0 text-blue-400 font-medium text-[18px] drop-shadow-md whitespace-nowrap animate-[marquee_9s_linear_infinite_3s]">主播牛逼！</div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Player Controls - Only show on hover or when paused */}
          <div className={`absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end px-6 pb-4 transition-opacity duration-300 ${isHoveringPlayer || !isPlaying ? 'opacity-100' : 'opacity-0'}`}>
            <div className="flex items-center justify-between text-white/90">
              
              {/* Left Controls */}
              <div className="flex items-center gap-4">
                <button onClick={() => setIsPlaying(!isPlaying)} className="hover:text-white transition-colors" title={isPlaying ? "暂停直播" : "播放直播"}>
                  {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                </button>
                <button className="hover:text-white transition-colors" title="刷新直播间">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              {/* Right Controls */}
              <div className="flex items-center gap-5">
                <div className="flex items-center gap-2 group/volume">
                  <button onClick={() => setIsMuted(!isMuted)} className="hover:text-white transition-colors" title="直播间音量调节">
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                  <div className="w-0 overflow-hidden group-hover/volume:w-20 transition-all duration-300 flex items-center">
                    <div className="w-full h-1 bg-white/30 rounded-full mx-2 cursor-pointer">
                      <div className="w-1/2 h-full bg-white rounded-full"></div>
                    </div>
                  </div>
                </div>

                <div className="w-px h-4 bg-white/20" />

                <button 
                  onClick={() => setShowDanmaku(!showDanmaku)} 
                  className={`flex items-center gap-1.5 text-[13px] font-medium transition-colors ${showDanmaku ? 'text-white' : 'text-white/50 hover:text-white'}`}
                  title="弹幕开关"
                >
                  <MessageSquare className="w-4 h-4" /> 弹幕
                </button>

                <div className="w-px h-4 bg-white/20" />

                <button className="hover:text-white transition-colors">
                  <Settings className="w-4 h-4" />
                </button>

                <button onClick={toggleFullScreen} className="hover:text-white transition-colors" title="全屏直播画面">
                  {isFullScreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                </button>
              </div>

            </div>
          </div>
          
          {/* Custom style for marquee animation */}
          <style>{`
            @keyframes marquee {
              0% { transform: translateX(100%); left: 100%; }
              100% { transform: translateX(-100%); left: -100%; }
            }
          `}</style>
        </div>

        {/* Right Sidebar (Chat & Danmaku) - Hidden in Fullscreen unless overlaid */}
        {!isFullScreen && (
          <div className="w-[320px] bg-white rounded-2xl border border-slate-100/60 shadow-sm flex flex-col shrink-0 overflow-hidden">
            
            <div className="h-12 border-b border-slate-100/60 flex items-center px-4 bg-slate-50/50 shrink-0">
              <span className="text-[14px] font-semibold text-slate-900 tracking-widest mx-auto">弹幕显示区域</span>
            </div>

            {/* Chat List */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/20">
               {/* Mock Chat Items */}
               <div className="text-[13px] leading-relaxed">
                 <span className="text-slate-400 font-medium mr-2">系统:</span>
                 <span className="text-slate-500">欢迎来到直播间，请大家文明发言。</span>
               </div>
               <div className="text-[13px] leading-relaxed">
                 <span className="text-blue-500 font-medium mr-2">老粉丝:</span>
                 <span className="text-slate-700">第一第一第一！</span>
               </div>
               <div className="text-[13px] leading-relaxed">
                 <span className="text-emerald-500 font-medium mr-2">路人甲:</span>
                 <span className="text-slate-700">主播今天玩什么游戏？</span>
               </div>
            </div>

            {/* Chat Input */}
            <div className="p-3 border-t border-slate-100/60 bg-white shrink-0 flex gap-2">
              <input 
                type="text" 
                placeholder="发个弹幕吧" 
                className="flex-1 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-[13px] outline-none focus:border-slate-300 focus:bg-white transition-colors"
              />
              <button className="px-4 bg-slate-900 text-white rounded-lg text-[13px] font-medium hover:bg-slate-800 transition-colors shrink-0 shadow-sm">
                发送
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

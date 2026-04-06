import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Copy, Edit3, Settings, AlertCircle, Eye, EyeOff, Users, Flame } from "lucide-react";

export function StreamSetup() {
  const navigate = useNavigate();
  const [isLive, setIsLive] = useState(false);
  const [title, setTitle] = useState("新主播第一次直播很紧张！！！！");
  const [showUrl, setShowUrl] = useState(false);
  const [showKey, setShowKey] = useState(false);

  // Mock Stream Info
  const streamInfo = {
    url: "rtmp://push.simplelive.com/live",
    key: "stream_key_abc123xyz_do_not_share"
  };

  return (
    <div className="min-h-screen bg-[#FDFDFE] flex flex-col">
      {/* Top Header */}
      <header className="h-[88px] bg-white border-b border-slate-100/60 flex items-center shrink-0">
        <div className="flex-1 flex flex-col justify-center gap-2.5 pl-6 pr-4">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-slate-100 text-slate-700 text-[13px] font-medium rounded-full">主机游戏</span>
            <div className="flex items-center gap-2 group cursor-pointer">
              <h1 className="text-[20px] font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{title}</h1>
              <Edit3 className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
          <div className="flex items-center gap-4 text-[13px] text-slate-500 pl-1">
            <span className="font-medium text-slate-700">どメ半哑ゝ*</span>
            <div className="flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-amber-500" />
              <span>全站小时榜</span>
            </div>
            <span>31217471</span>
            <div className="flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              <span>24595</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              <span>{isLive ? "12" : "0"}</span>
            </div>
          </div>
        </div>

        {/* Right Header for Chat */}
        <div className="w-[320px] h-full border-l border-slate-100/60 flex items-center px-4 shrink-0 bg-slate-50/20">
          <span className="text-[15px] font-semibold text-slate-900">直播间互动</span>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Side: Common Features (Placeholder) */}
        <div className="w-[200px] border-r border-slate-100/60 bg-white/50 hidden md:flex flex-col items-center justify-center p-6 shrink-0">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4 text-slate-400">
             <Settings className="w-6 h-6" />
          </div>
          <span className="text-[15px] font-medium text-slate-400 text-center">常用功能区域<br/>(待开发)</span>
        </div>

        {/* Center: Stream Config Area */}
        <div className="flex-1 flex flex-col bg-slate-50/30 relative">
          
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="w-full max-w-[500px] bg-white rounded-3xl p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/80">
              
              <div className="flex items-center gap-2 mb-8 text-rose-500 bg-rose-50 px-4 py-3 rounded-xl">
                 <AlertCircle className="w-4 h-4 shrink-0" />
                 <span className="text-[13px]">推流码是您的开播凭证，请勿泄露给他人。</span>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <label className="text-[14px] font-medium text-slate-600 w-16 text-right shrink-0">推流地址</label>
                  <div className="flex-1 flex items-stretch bg-slate-50 border border-slate-200 rounded-lg overflow-hidden group hover:border-slate-300 transition-colors">
                    <input 
                      type={showUrl ? "text" : "password"} 
                      readOnly 
                      value={streamInfo.url} 
                      className="flex-1 bg-transparent px-4 py-2.5 text-[14px] text-slate-700 outline-none tracking-wider" 
                    />
                    <button 
                      onClick={() => setShowUrl(!showUrl)} 
                      className="px-3 text-slate-400 hover:text-slate-600 transition-colors flex items-center justify-center bg-slate-50"
                      title={showUrl ? "隐藏" : "显示"}
                    >
                      {showUrl ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button className="px-6 bg-amber-500 text-white text-[14px] font-medium hover:bg-amber-600 transition-colors flex items-center justify-center">
                      复制
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <label className="text-[14px] font-medium text-slate-600 w-16 text-right shrink-0">直播码</label>
                  <div className="flex-1 flex items-stretch bg-slate-50 border border-slate-200 rounded-lg overflow-hidden group hover:border-slate-300 transition-colors">
                    <input 
                      type={showKey ? "text" : "password"} 
                      readOnly 
                      value={streamInfo.key} 
                      className="flex-1 bg-transparent px-4 py-2.5 text-[14px] text-slate-700 outline-none tracking-wider" 
                    />
                    <button 
                      onClick={() => setShowKey(!showKey)} 
                      className="px-3 text-slate-400 hover:text-slate-600 transition-colors flex items-center justify-center bg-slate-50"
                      title={showKey ? "隐藏" : "显示"}
                    >
                      {showKey ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button className="px-6 bg-amber-500 text-white text-[14px] font-medium hover:bg-amber-600 transition-colors flex items-center justify-center">
                      复制
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="h-[72px] bg-white border-t border-slate-100/60 flex items-center justify-end px-8 gap-4 shrink-0">
            <button 
              onClick={() => setIsLive(!isLive)}
              className={`px-8 py-2.5 rounded-full text-[14px] font-medium transition-all shadow-sm ${isLive ? 'bg-rose-500 text-white hover:bg-rose-600' : 'bg-[#FDD835] text-slate-900 hover:bg-[#FBC02D] hover:shadow-md'}`}
            >
              {isLive ? "结束直播" : "开始直播"}
            </button>
            <button 
              onClick={() => navigate("/stream/select")}
              className="px-8 py-2.5 rounded-full border border-slate-200 text-[14px] font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
              返回
            </button>
          </div>
        </div>

        {/* Right Side: Danmaku & Chat */}
        <div className="w-[320px] bg-white border-l border-slate-100/60 flex flex-col shrink-0">
          <div className="flex-1 flex items-center justify-center p-4 bg-slate-50/30">
            <span className="text-[20px] font-bold text-slate-300 tracking-widest">弹幕显示区域</span>
          </div>

          <div className="p-3 border-t border-slate-100/60 bg-white shrink-0 flex gap-2">
            <input 
              type="text" 
              placeholder="发个弹幕吧" 
              className="flex-1 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-[13px] outline-none focus:border-slate-300 transition-colors"
            />
            <button className="px-4 bg-slate-900 text-white rounded-lg text-[13px] font-medium hover:bg-slate-800 transition-colors shrink-0">
              发送
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

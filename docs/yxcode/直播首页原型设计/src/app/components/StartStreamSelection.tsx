import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link, useNavigate } from "react-router";
import { Radio, Tv } from "lucide-react";

export function StartStreamSelection() {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<"webrtc" | "obs" | null>(null);

  const handleNext = () => {
    if (selectedType === "obs") {
      navigate("/stream/setup");
    }
    // WebRTC 暂不做
  };

  return (
    <div className="min-h-screen bg-[#FDFDFE] flex flex-col items-center pt-24 relative overflow-hidden">
      {/* Background Watermark */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[20vw] font-black text-slate-50/80 whitespace-nowrap pointer-events-none select-none z-0 tracking-tighter">
        Go Live
      </div>

      <div className="relative z-10 w-full max-w-[800px] flex flex-col items-center">
        <h1 className="text-[28px] font-bold text-slate-900 mb-16 tracking-tight">选择开播类型</h1>

        <div className="flex items-center gap-16 mb-20">
          {/* Quick Stream (WebRTC) */}
          <button 
            onClick={() => setSelectedType("webrtc")}
            className={`flex flex-col items-center gap-4 group transition-all duration-300 ${selectedType === "webrtc" ? "scale-105" : "hover:scale-105"}`}
          >
            <div className={`w-32 h-32 rounded-full border-[1.5px] flex items-center justify-center transition-all duration-300 ${selectedType === "webrtc" ? "border-slate-900 bg-slate-900 text-white shadow-lg shadow-slate-900/20" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:shadow-md"}`}>
              <Radio className="w-10 h-10" />
            </div>
            <span className={`text-[15px] font-medium transition-colors ${selectedType === "webrtc" ? "text-slate-900" : "text-slate-600 group-hover:text-slate-900"}`}>极速开播</span>
          </button>

          {/* OBS Stream */}
          <button 
            onClick={() => setSelectedType("obs")}
            className={`flex flex-col items-center gap-4 group transition-all duration-300 ${selectedType === "obs" ? "scale-105" : "hover:scale-105"}`}
          >
            <div className={`w-32 h-32 rounded-full border-[1.5px] flex items-center justify-center transition-all duration-300 ${selectedType === "obs" ? "border-slate-900 bg-slate-900 text-white shadow-lg shadow-slate-900/20" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:shadow-md"}`}>
              <Tv className="w-10 h-10" />
            </div>
            <span className={`text-[15px] font-medium transition-colors ${selectedType === "obs" ? "text-slate-900" : "text-slate-600 group-hover:text-slate-900"}`}>第三方推流</span>
          </button>
        </div>

        <button 
          onClick={handleNext}
          disabled={!selectedType}
          className={`px-32 py-4 rounded-full text-[18px] font-medium transition-all duration-300 ${selectedType ? "bg-slate-900 text-white hover:bg-slate-800 hover:-translate-y-1 hover:shadow-xl shadow-slate-900/20" : "bg-slate-100 text-slate-400 cursor-not-allowed"}`}
        >
          下一步
        </button>
        
        <Link to="/" className="mt-8 text-[14px] text-slate-500 hover:text-slate-900 transition-colors">
          返回首页
        </Link>
      </div>
    </div>
  );
}

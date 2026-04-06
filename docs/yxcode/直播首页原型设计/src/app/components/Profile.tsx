import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router";
import { ChevronLeft, Edit3, User, History, Heart, Home } from "lucide-react";

// Mock Data
const MOCK_USER = {
  name: "どメ半哑ゝ*",
  avatar: "https://images.unsplash.com/photo-1643816831186-b2427a8f9f2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMHdvbWFuJTIwc21pbGluZyUyMHBvcnRyYWl0fGVufDF8fHx8MTc3NDQ5MjE0NXww&ixlib=rb-4.1.0&q=80&w=200",
  age: "23",
  gender: "男",
  location: "广东 东莞",
  signature: "你还没有写个个性签名。",
};

const MOCK_FOLLOWS = [
  { id: "1", streamerName: "阿木木", title: "新主播第一次直播很紧张，求陪伴", category: "英雄联盟", followers: "1.2万", isLive: true, avatar: "https://images.unsplash.com/photo-1611695434369-a8f5d76ceb7b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMG1hbiUyMHBvcnRyYWl0JTIwc21pbGV8ZW58MXx8fHwxNzc0NDk2NDM0fDA&ixlib=rb-4.1.0&q=80&w=200" },
  { id: "2", streamerName: "月亮不睡", title: "深夜电台：听我讲故事", category: "闲聊", followers: "8,432", isLive: false, avatar: "https://images.unsplash.com/photo-1673767297172-220430e2d382?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMHN0cmVhbWluZyUyMHBvZGNhc3QlMjBzdHVkaW98ZW58MXx8fHwxNzc0NTI5MzY4fDA&ixlib=rb-4.1.0&q=80&w=1080" },
  { id: "3", streamerName: "电竞少女猫", title: "周末上分发车！", category: "绝地求生", followers: "3.5万", isLive: true, avatar: "https://images.unsplash.com/photo-1758025196602-ba4a98310e6f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnaXJsJTIwd2l0aCUyMGhlYWRzZXQlMjBnYW1lcnxlbnwxfHx8fDE3NzQ1MjkzNjl8MA&ixlib=rb-4.1.0&q=80&w=1080" },
  { id: "4", streamerName: "音乐老炮儿", title: "户外跨年音乐节现场直击！", category: "音乐现场", followers: "10.2万", isLive: false, avatar: "https://images.unsplash.com/photo-1764805354913-953132e82086?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsaXZlJTIwbXVzaWMlMjBwZXJmb3JtYW5jZSUyMGNvbmNlcnR8ZW58MXx8fHwxNzc0NTI5MzY5fDA&ixlib=rb-4.1.0&q=80&w=1080" },
];

const MOCK_HISTORY = [
  {
    date: "2026年03月26日",
    items: [
      MOCK_FOLLOWS[3],
      MOCK_FOLLOWS[1],
    ]
  },
  {
    date: "2026年03月25日",
    items: [
      MOCK_FOLLOWS[0],
      MOCK_FOLLOWS[2],
    ]
  }
];

// Sub-components
function StreamCard({ stream }: { stream: any }) {
  return (
    <div className="flex gap-4 p-3 bg-white border border-slate-100/80 rounded-2xl hover:border-slate-200 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer">
      <div className="relative w-[130px] aspect-[16/10] rounded-xl overflow-hidden bg-slate-100 shrink-0">
        <img src={stream.avatar} alt={stream.streamerName} className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
        {stream.isLive && (
          <div className="absolute top-1.5 right-1.5 bg-rose-500 text-white text-[10px] font-bold px-1.5 py-[2px] rounded-md tracking-wide shadow-sm">
            直播中
          </div>
        )}
      </div>
      <div className="flex flex-col justify-center py-1 overflow-hidden min-w-0 flex-1">
        <h3 className="text-[15px] font-semibold text-slate-900 truncate mb-1 group-hover:text-blue-600 transition-colors">{stream.streamerName}</h3>
        <p className="text-[12px] text-slate-500 truncate mb-2">{stream.title}</p>
        <div className="flex items-center gap-4 text-[12px] text-slate-400 mt-auto">
          <span className="truncate">直播: {stream.category}</span>
          <span className="shrink-0">关注: {stream.followers}人</span>
        </div>
      </div>
    </div>
  );
}

export function Profile() {
  const [activeMenu, setActiveMenu] = useState<"info" | "history">("info");
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<"follow" | "viewHistory">("follow");

  return (
    <div className="min-h-screen bg-[#FDFDFE] flex justify-center py-12 px-6">
      <div className="w-full max-w-[1200px] flex gap-8">
        
        {/* Left Sidebar */}
        <div className="w-[200px] shrink-0 flex flex-col gap-6">
          <div className="px-4">
            <h1 className="text-[18px] font-bold text-slate-900 tracking-tight">个人中心</h1>
          </div>
          
          <nav className="flex flex-col gap-1 relative">
            {/* Animated Indicator */}
            <motion.div 
              className="absolute left-0 w-1 bg-slate-900 rounded-r-full transition-all duration-300"
              initial={false}
              animate={{ 
                top: activeMenu === "info" ? "4px" : "56px",
                height: "40px"
              }}
            />

            <button
              onClick={() => { setActiveMenu("info"); setIsEditing(false); }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-medium transition-all duration-300 ${activeMenu === "info" ? "text-slate-900 bg-slate-50/80" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50/50"}`}
            >
              我的信息
            </button>
            <button
              onClick={() => setActiveMenu("history")}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-medium transition-all duration-300 ${activeMenu === "history" ? "text-slate-900 bg-slate-50/80" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50/50"}`}
            >
              关注与历史
            </button>
          </nav>

          <div className="mt-auto px-4 pb-4">
            <Link to="/" className="flex items-center gap-2 text-[13px] text-slate-400 hover:text-slate-900 transition-colors group">
              <Home className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 返回首页
            </Link>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-white border border-slate-100/60 shadow-[0_4px_30px_rgb(0,0,0,0.02)] rounded-[32px] p-10 min-h-[600px] relative overflow-hidden">
          <AnimatePresence mode="wait">
            
            {/* == MY INFO VIEW == */}
            {activeMenu === "info" && !isEditing && (
              <motion.div
                key="info-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="max-w-[800px]"
              >
                {/* Header */}
                <div className="flex items-center gap-6 mb-12">
                  <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-slate-100 shadow-sm shrink-0">
                    <img src={MOCK_USER.avatar} alt="avatar" className="w-full h-full object-cover" />
                  </div>
                  <h2 className="text-[26px] font-bold text-slate-900">{MOCK_USER.name}</h2>
                </div>

                {/* Base Info */}
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <h3 className="text-[14px] font-semibold text-slate-900 shrink-0">基础信息</h3>
                    <div className="flex-1 h-px bg-slate-100/80" />
                    <button onClick={() => setIsEditing(true)} className="flex items-center gap-1.5 text-[13px] text-slate-500 hover:text-slate-900 transition-colors shrink-0">
                      <Edit3 className="w-3.5 h-3.5" /> 编辑资料
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-y-6 gap-x-12 px-2">
                    <div className="text-[14px]"><span className="text-slate-500 mr-4">年龄:</span> <span className="text-slate-900 font-medium">{MOCK_USER.age}岁</span></div>
                    <div className="text-[14px]"><span className="text-slate-500 mr-4">性别:</span> <span className="text-slate-900 font-medium">{MOCK_USER.gender}</span></div>
                    <div className="text-[14px]"><span className="text-slate-500 mr-4">所在地:</span> <span className="text-slate-900 font-medium">{MOCK_USER.location}</span></div>
                    <div className="text-[14px]"><span className="text-slate-500 mr-4">个性签名:</span> <span className="text-slate-900 font-medium">{MOCK_USER.signature}</span></div>
                  </div>
                </div>

                {/* Account Settings */}
                <div className="mt-14">
                  <div className="flex items-center gap-4 mb-6">
                    <h3 className="text-[14px] font-semibold text-slate-900 shrink-0">账号设置</h3>
                    <div className="flex-1 h-px bg-slate-100/80" />
                  </div>
                  
                  <div className="flex items-center justify-between px-2 py-2 hover:bg-slate-50/50 rounded-xl transition-colors">
                    <span className="text-[15px] text-slate-800 font-medium">修改密码</span>
                    <button className="text-[13px] text-slate-600 hover:text-slate-900 border border-slate-200 px-5 py-1.5 rounded-full hover:bg-slate-50 hover:border-slate-300 transition-all">
                      去修改
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* == MY INFO EDIT == */}
            {activeMenu === "info" && isEditing && (
              <motion.div
                key="info-edit"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="max-w-[540px]"
              >
                <button onClick={() => setIsEditing(false)} className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 mb-8 transition-colors text-[14px] font-medium group">
                  <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> 
                  <span className="text-[18px] font-bold text-slate-900 ml-1 group-hover:text-slate-900">编辑资料</span>
                </button>
                
                <div className="space-y-6">
                  <div className="flex items-center gap-6">
                    <label className="w-16 shrink-0 text-[14px] text-slate-500 text-right">昵称</label>
                    <div className="flex-1 flex items-center gap-3">
                      <input type="text" defaultValue={MOCK_USER.name} className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-[14px] text-slate-900 focus:border-slate-300 focus:ring-4 focus:ring-slate-100 outline-none transition-all hover:border-slate-300" />
                      <button className="text-[13px] text-blue-500 hover:text-blue-600 font-medium shrink-0 flex items-center gap-1"><Edit3 className="w-3.5 h-3.5"/> 修改昵称</button>
                    </div>
                  </div>

                  <div className="flex items-start gap-6">
                    <label className="w-16 shrink-0 text-[14px] text-slate-500 pt-3 text-right">个性签名</label>
                    <textarea rows={3} defaultValue={MOCK_USER.signature} className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-[14px] text-slate-900 focus:border-slate-300 focus:ring-4 focus:ring-slate-100 outline-none transition-all resize-none hover:border-slate-300" />
                  </div>

                  <div className="flex items-center gap-6">
                    <label className="w-16 shrink-0 text-[14px] text-slate-500 text-right">性别</label>
                    <div className="flex items-center gap-6 flex-1 py-2">
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input type="radio" name="gender" defaultChecked={MOCK_USER.gender === '男'} className="accent-slate-900 w-4 h-4 cursor-pointer" />
                        <span className="text-[14px] text-slate-700 group-hover:text-slate-900">男</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input type="radio" name="gender" defaultChecked={MOCK_USER.gender === '女'} className="accent-slate-900 w-4 h-4 cursor-pointer" />
                        <span className="text-[14px] text-slate-700 group-hover:text-slate-900">女</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <label className="w-16 shrink-0 text-[14px] text-slate-500 text-right">生日</label>
                    <div className="flex items-center gap-2 flex-1">
                      <select className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-[14px] text-slate-900 outline-none w-[100px] hover:border-slate-300 transition-colors cursor-pointer appearance-none">
                        <option>2003</option>
                        <option>2004</option>
                      </select>
                      <span className="text-[14px] text-slate-500">年</span>
                      <select className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-[14px] text-slate-900 outline-none w-[80px] hover:border-slate-300 transition-colors cursor-pointer appearance-none">
                        <option>09</option>
                        <option>10</option>
                      </select>
                      <span className="text-[14px] text-slate-500">月</span>
                      <select className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-[14px] text-slate-900 outline-none w-[80px] hover:border-slate-300 transition-colors cursor-pointer appearance-none">
                        <option>08</option>
                        <option>09</option>
                      </select>
                      <span className="text-[14px] text-slate-500">日</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <label className="w-16 shrink-0 text-[14px] text-slate-500 text-right">所在地</label>
                    <div className="flex items-center gap-3 flex-1">
                      <select className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-[14px] text-slate-900 outline-none flex-1 hover:border-slate-300 transition-colors cursor-pointer appearance-none">
                        <option>广东</option>
                        <option>北京</option>
                      </select>
                      <select className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-[14px] text-slate-900 outline-none flex-1 hover:border-slate-300 transition-colors cursor-pointer appearance-none">
                        <option>东莞</option>
                        <option>深圳</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex pl-[88px] pt-6">
                    <button onClick={() => setIsEditing(false)} className="px-10 py-3 bg-slate-900 text-white rounded-xl text-[14px] font-semibold hover:bg-slate-800 transition-all hover:shadow-lg hover:-translate-y-0.5 shadow-slate-900/20 active:scale-95">
                      保存
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* == HISTORY & FOLLOW VIEW == */}
            {activeMenu === "history" && (
              <motion.div
                key="history-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="h-full flex flex-col"
              >
                <div className="flex items-baseline gap-4 mb-8">
                  <h2 className="text-[24px] font-bold text-slate-900">关注与观看历史</h2>
                  <span className="text-[13px] text-slate-500">关注了 {MOCK_FOLLOWS.length} 个主播</span>
                </div>

                {/* Tabs */}
                <div className="flex gap-8 border-b border-slate-100 mb-8 relative">
                  <button 
                    onClick={() => setActiveTab("follow")}
                    className={`pb-3 text-[15px] font-medium transition-colors ${activeTab === "follow" ? "text-slate-900" : "text-slate-500 hover:text-slate-900"}`}
                  >
                    关注
                  </button>
                  <button 
                    onClick={() => setActiveTab("viewHistory")}
                    className={`pb-3 text-[15px] font-medium transition-colors ${activeTab === "viewHistory" ? "text-slate-900" : "text-slate-500 hover:text-slate-900"}`}
                  >
                    观看历史
                  </button>
                  
                  {/* Tab Indicator */}
                  <motion.div 
                    className="absolute bottom-0 h-[2px] bg-slate-900 rounded-t-full"
                    initial={false}
                    animate={{ 
                      left: activeTab === "follow" ? "0px" : "64px",
                      width: activeTab === "follow" ? "32px" : "64px"
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                </div>

                {/* Follow List (With Pagination) */}
                {activeTab === "follow" && (
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="flex flex-col flex-1"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-auto">
                      {MOCK_FOLLOWS.map(stream => (
                        <StreamCard key={stream.id} stream={stream} />
                      ))}
                    </div>
                    
                    {/* Pagination */}
                    <div className="flex justify-end items-center gap-2 mt-10 pt-6 border-t border-slate-50/50">
                      <button className="w-8 h-8 rounded-lg flex items-center justify-center text-[13px] font-medium bg-slate-900 text-white shadow-sm">1</button>
                      <button className="w-8 h-8 rounded-lg flex items-center justify-center text-[13px] font-medium bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">2</button>
                      <button className="px-3 h-8 rounded-lg flex items-center justify-center text-[13px] font-medium bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors ml-1">下一页</button>
                    </div>
                  </motion.div>
                )}

                {/* History List (No Pagination, Timeline based) */}
                {activeTab === "viewHistory" && (
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="pb-10"
                  >
                    {MOCK_HISTORY.map((group, idx) => (
                      <div key={idx} className="mb-10 last:mb-0">
                        <div className="flex items-center gap-3 mb-5">
                          <div className="w-2.5 h-2.5 rounded-full border-[2px] border-slate-300 bg-white" />
                          <span className="text-[14px] font-medium text-slate-600">{group.date}</span>
                          <div className="flex-1 h-px bg-slate-100" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 ml-2 border-l border-slate-100/50 pl-4 py-2">
                          {group.items.map(stream => (
                            <StreamCard key={stream.id} stream={stream} />
                          ))}
                        </div>
                      </div>
                    ))}
                    
                    <div className="text-center mt-12 text-[13px] text-slate-400">
                      观看记录一页展示完，不用进行分页
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

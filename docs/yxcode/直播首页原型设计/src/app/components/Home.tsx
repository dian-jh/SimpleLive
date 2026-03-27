import { motion } from "motion/react";
import { StreamCard } from "./StreamCard";
import { Sparkles, TrendingUp, Gamepad2, Mic, MonitorPlay, Music, Code, Compass } from "lucide-react";

const CATEGORIES = [
  { id: "all", label: "推荐", icon: Sparkles },
  { id: "hot", label: "热门", icon: TrendingUp },
  { id: "gaming", label: "游戏", icon: Gamepad2 },
  { id: "chat", label: "颜值", icon: Mic },
  { id: "tech", label: "科技", icon: Code },
  { id: "music", label: "音乐", icon: Music },
  { id: "outdoor", label: "户外", icon: Compass },
  { id: "pc", label: "端游", icon: MonitorPlay },
];

const MOCK_STREAMS = [
  {
    id: "1",
    title: "新主播第一次直播很紧张，求陪伴",
    thumbnailUrl: "https://images.unsplash.com/photo-1598550487031-0898b4852123?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlc3BvcnRzJTIwZ2FtaW5nJTIwc3RyZWFtfGVufDF8fHx8MTc3NDUyOTM2NHww&ixlib=rb-4.1.0&q=80&w=1080",
    streamerName: "阿木木",
    streamerAvatar: "https://images.unsplash.com/photo-1611695434369-a8f5d76ceb7b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMG1hbiUyMHBvcnRyYWl0JTIwc21pbGV8ZW58MXx8fHwxNzc0NDk2NDM0fDA&ixlib=rb-4.1.0&q=80&w=200",
    viewerCount: "1.2万",
    category: "英雄联盟",
    tags: ["新手", "上分", "白银"]
  },
  {
    id: "2",
    title: "深夜电台：听我讲故事",
    thumbnailUrl: "https://images.unsplash.com/photo-1673767297172-220430e2d382?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMHN0cmVhbWluZyUyMHBvZGNhc3QlMjBzdHVkaW98ZW58MXx8fHwxNzc0NTI5MzY4fDA&ixlib=rb-4.1.0&q=80&w=1080",
    streamerName: "月亮不睡",
    streamerAvatar: "https://images.unsplash.com/photo-1643816831186-b2427a8f9f2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMHdvbWFuJTIwc21pbGluZyUyMHBvcnRyYWl0fGVufDF8fHx8MTc3NDQ5MjE0NXww&ixlib=rb-4.1.0&q=80&w=200",
    viewerCount: "8,432",
    category: "闲聊",
    tags: ["电台", "治愈", "陪伴"]
  },
  {
    id: "3",
    title: "周末上分发车！来个稳健的辅助",
    thumbnailUrl: "https://images.unsplash.com/photo-1758025196602-ba4a98310e6f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnaXJsJTIwd2l0aCUyMGhlYWRzZXQlMjBnYW1lcnxlbnwxfHx8fDE3NzQ1MjkzNjl8MA&ixlib=rb-4.1.0&q=80&w=1080",
    streamerName: "电竞少女猫",
    streamerAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200",
    viewerCount: "3.5万",
    category: "绝地求生",
    tags: ["技术流", "刚枪"]
  },
  {
    id: "4",
    title: "户外跨年音乐节现场直击！",
    thumbnailUrl: "https://images.unsplash.com/photo-1764805354913-953132e82086?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsaXZlJTIwbXVzaWMlMjBwZXJmb3JtYW5jZSUyMGNvbmNlcnR8ZW58MXx8fHwxNzc0NTI5MzY5fDA&ixlib=rb-4.1.0&q=80&w=1080",
    streamerName: "音乐老炮儿",
    streamerAvatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200",
    viewerCount: "10.2万",
    category: "音乐现场",
    tags: ["摇滚", "狂欢"]
  },
  {
    id: "5",
    title: "从零开始做个全栈Web应用",
    thumbnailUrl: "https://images.unsplash.com/photo-1608306448197-e83633f1261c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXZlbG9wZXIlMjBjb2RpbmclMjBzY3JlZW58ZW58MXx8fHwxNzc0NTI2NjgyfDA&ixlib=rb-4.1.0&q=80&w=1080",
    streamerName: "码农老李",
    streamerAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200",
    viewerCount: "2,105",
    category: "科技/编程",
    tags: ["React", "开发日常"]
  },
  {
    id: "6",
    title: "今日王者百星局，冲！",
    thumbnailUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1080",
    streamerName: "野王归来",
    streamerAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200",
    viewerCount: "5.6万",
    category: "王者荣耀",
    tags: ["国服", "教学"]
  },
  {
    id: "7",
    title: "周末放空，随便聊聊分享生活",
    thumbnailUrl: "https://images.unsplash.com/photo-1516280440502-6930d663b65e?auto=format&fit=crop&q=80&w=1080",
    streamerName: "茶茶",
    streamerAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200",
    viewerCount: "1.1万",
    category: "颜值",
    tags: ["聊天", "治愈"]
  },
  {
    id: "8",
    title: "深渊第12层满星平民打法教学",
    thumbnailUrl: "https://images.unsplash.com/photo-1605901309584-818e25960b8f?auto=format&fit=crop&q=80&w=1080",
    streamerName: "攻略达人",
    streamerAvatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&q=80&w=200",
    viewerCount: "4.8万",
    category: "原神",
    tags: ["攻略", "深渊"]
  },
  {
    id: "9",
    title: "吉他弹唱，点歌走起",
    thumbnailUrl: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&q=80&w=1080",
    streamerName: "流浪歌手小黑",
    streamerAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200",
    viewerCount: "5,302",
    category: "音乐",
    tags: ["吉他", "翻唱"]
  },
  {
    id: "10",
    title: "探索无人区，真实荒野求生",
    thumbnailUrl: "https://images.unsplash.com/photo-1533692328991-08159ff19fca?auto=format&fit=crop&q=80&w=1080",
    streamerName: "贝爷信徒",
    streamerAvatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=200",
    viewerCount: "2.1万",
    category: "户外",
    tags: ["探险", "风景"]
  }
];

export function Home() {
  return (
    <div className="max-w-[1600px] mx-auto px-6 py-8">
      {/* Categories Bar */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-3 mb-10 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden"
      >
        {CATEGORIES.map((cat, idx) => (
          <button
            key={cat.id}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[14px] font-medium transition-all duration-300 whitespace-nowrap
              ${idx === 0 
                ? "bg-slate-900 text-white shadow-md shadow-slate-900/20" 
                : "bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-slate-200/60"
              }
            `}
          >
            <cat.icon className="w-4 h-4" />
            {cat.label}
          </button>
        ))}
      </motion.div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-10">
        {MOCK_STREAMS.map((stream, idx) => (
          <StreamCard 
            key={stream.id} 
            {...stream} 
          />
        ))}
      </div>
    </div>
  );
}

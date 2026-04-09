import { Search, Plus, Heart, Clock, Bell } from "lucide-react";
import { Link } from "react-router";

export function Navbar() {
  return (
    <header className="fixed top-0 inset-x-0 h-16 bg-white/80 backdrop-blur-xl border-b border-slate-100/60 z-50 transition-all duration-300">
      <div className="max-w-[1600px] mx-auto h-full px-6 flex items-center justify-between gap-8">
        {/* Left: Logo & Nav */}
        <div className="flex items-center gap-10">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-lg shadow-sm group-hover:scale-105 transition-transform duration-300">
              S
            </div>
            <span className="font-bold text-[20px] tracking-tight text-slate-900">
              简播<span className="text-slate-400 font-medium ml-1 text-sm">Live</span>
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-7">
            <Link to="/" className="text-[15px] font-semibold text-slate-900 relative after:absolute after:bottom-[-20px] after:left-1/2 after:-translate-x-1/2 after:w-4 after:h-[3px] after:bg-slate-900 after:rounded-t-full transition-colors">首页</Link>
            <Link to="#" className="text-[15px] font-medium text-slate-500 hover:text-slate-900 transition-colors">分类</Link>
          </nav>
        </div>

        {/* Center: Search */}  
        <div className="flex-1 max-w-[480px] hidden sm:block">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400 group-focus-within:text-slate-700 transition-colors duration-300" />
            </div>
            <input
              type="text"
              placeholder="搜索直播间、主播、分类..."
              className="block w-full pl-11 pr-4 py-2.5 bg-slate-100/60 border border-transparent rounded-full text-[14px] text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-slate-200/80 focus:ring-4 focus:ring-slate-100 transition-all duration-300 outline-none hover:bg-slate-100"
            />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-5">
          <Link to="/stream/select" className="hidden lg:flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-[14px] font-medium rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-slate-300/50 hover:-translate-y-0.5">
            <Plus className="w-4 h-4" />
            <span>我要开播</span>
          </Link>
          
          <div className="h-5 w-px bg-slate-200 hidden lg:block mx-1"></div>
          
          <Link to="/profile" className="flex flex-col items-center gap-1 text-slate-500 hover:text-slate-900 transition-colors group">
            <Heart className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
            <span className="text-[11px] font-medium hidden md:block mt-0.5">关注</span>
          </Link>
          
          <Link to="/profile" className="flex flex-col items-center gap-1 text-slate-500 hover:text-slate-900 transition-colors group">
            <Clock className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
            <span className="text-[11px] font-medium hidden md:block mt-0.5">历史</span>
          </Link>

          <Link to="/profile" className="ml-3 w-[38px] h-[38px] rounded-full overflow-hidden border-2 border-transparent hover:border-slate-200 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 hover:shadow-md">
             <img src="https://images.unsplash.com/photo-1643816831186-b2427a8f9f2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMHdvbWFuJTIwc21pbGluZyUyMHBvcnRyYWl0fGVufDF8fHx8MTc3NDQ5MjE0NXww&ixlib=rb-4.1.0&q=80&w=200" alt="User avatar" className="w-full h-full object-cover" />
          </Link>
        </div>
      </div>
    </header>
  );
}

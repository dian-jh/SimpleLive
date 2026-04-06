import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Smartphone, Lock, EyeOff, Eye } from "lucide-react";

export function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="min-h-screen bg-[#FDFDFE] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Watermark */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[18vw] font-black text-slate-50/80 whitespace-nowrap pointer-events-none select-none z-0 tracking-tighter">
        S Live
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-[420px] relative z-10">
        <motion.div
          layout
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white/80 backdrop-blur-xl py-10 px-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:rounded-[32px] border border-slate-100/60"
        >
          <AnimatePresence mode="wait">
            {isLogin ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-8 text-center">
                  <h2 className="text-[26px] font-bold text-slate-900 tracking-tight">
                    登录 <span className="text-slate-400">Simple Live</span>
                  </h2>
                </div>

                <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Smartphone className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      className="block w-full pl-11 pr-4 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl text-[14px] text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-slate-200 focus:ring-4 focus:ring-slate-100/50 transition-all duration-300 outline-none hover:bg-slate-50"
                      placeholder="请输入手机号/邮箱"
                    />
                  </div>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      className="block w-full pl-11 pr-12 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl text-[14px] text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-slate-200 focus:ring-4 focus:ring-slate-100/50 transition-all duration-300 outline-none hover:bg-slate-50"
                      placeholder="请输入密码"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <div className="relative flex items-center justify-center">
                        <input type="checkbox" className="peer sr-only" defaultChecked />
                        <div className="w-4 h-4 rounded border border-slate-200 bg-white peer-checked:bg-slate-900 peer-checked:border-slate-900 transition-all" />
                        <svg className="absolute w-2.5 h-2.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" viewBox="0 0 12 10" fill="none">
                          <path d="M1.5 5.5L4.5 8.5L10.5 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <span className="text-[13px] text-slate-500 group-hover:text-slate-800 transition-colors">记住登录</span>
                    </label>

                    <button type="button" className="text-[13px] font-medium text-slate-900 hover:underline underline-offset-4">
                      忘记密码
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="w-full flex justify-center py-4 px-4 border border-transparent rounded-2xl shadow-sm text-[15px] font-semibold text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-all duration-300 hover:shadow-lg hover:shadow-slate-300 hover:-translate-y-0.5 mt-8"
                  >
                    立即登录
                  </button>
                </form>

                <div className="mt-8 text-center">
                  <p className="text-[13px] text-slate-500">
                    还没有账号？{" "}
                    <button
                      onClick={() => setIsLogin(false)}
                      className="font-semibold text-slate-900 hover:underline underline-offset-4 transition-all"
                    >
                      立即注册
                    </button>
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="register"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-8 text-center">
                  <h2 className="text-[26px] font-bold text-slate-900 tracking-tight">
                    注册新账号
                  </h2>
                </div>

                <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Smartphone className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      className="block w-full pl-11 pr-4 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl text-[14px] text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-slate-200 focus:ring-4 focus:ring-slate-100/50 transition-all duration-300 outline-none hover:bg-slate-50"
                      placeholder="请输入手机号/邮箱"
                    />
                  </div>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      className="block w-full pl-11 pr-12 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl text-[14px] text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-slate-200 focus:ring-4 focus:ring-slate-100/50 transition-all duration-300 outline-none hover:bg-slate-50"
                      placeholder="请设置密码"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      className="block w-full pl-11 pr-12 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl text-[14px] text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-slate-200 focus:ring-4 focus:ring-slate-100/50 transition-all duration-300 outline-none hover:bg-slate-50"
                      placeholder="请确认密码"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showConfirmPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="w-full flex justify-center py-4 px-4 border border-transparent rounded-2xl shadow-sm text-[15px] font-semibold text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-all duration-300 hover:shadow-lg hover:shadow-slate-300 hover:-translate-y-0.5 mt-8"
                  >
                    确认注册
                  </button>
                </form>

                <div className="mt-8 text-center">
                  <p className="text-[13px] text-slate-500">
                    已有账号？{" "}
                    <button
                      onClick={() => setIsLogin(true)}
                      className="font-semibold text-slate-900 hover:underline underline-offset-4 transition-all"
                    >
                      登录
                    </button>
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

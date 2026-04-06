import type { ReactNode } from 'react'

interface AuthLayoutProps {
  children: ReactNode
}

export const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#FDFDFE] px-4 py-12 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <span className="select-none whitespace-nowrap text-[18vw] font-black tracking-tighter text-slate-50/80">
          S live
        </span>
      </div>

      <section className="relative z-10 w-full max-w-[420px] rounded-[32px] border border-slate-100/60 bg-white/80 px-10 py-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl">
        {children}
      </section>
    </main>
  )
}

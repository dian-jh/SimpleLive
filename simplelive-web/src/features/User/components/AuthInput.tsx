import type { InputHTMLAttributes, ReactNode } from 'react'

interface AuthInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  leftIcon: ReactNode
  rightSlot?: ReactNode
}

const BASE_INPUT_CLASS =
  'block w-full rounded-2xl border border-slate-100 bg-slate-50/50 py-3.5 pl-11 text-[14px] text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-300 hover:bg-slate-50 focus:border-slate-200 focus:bg-white focus:ring-4 focus:ring-slate-100/50 disabled:cursor-not-allowed disabled:bg-slate-100'

export const AuthInput = ({ leftIcon, rightSlot, ...inputProps }: AuthInputProps) => {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
        {leftIcon}
      </div>

      <input
        {...inputProps}
        className={`${BASE_INPUT_CLASS} ${rightSlot ? 'pr-12' : 'pr-4'}`}
      />

      {rightSlot ? (
        <div className="absolute inset-y-0 right-0 flex items-center pr-4">
          {rightSlot}
        </div>
      ) : null}
    </div>
  )
}

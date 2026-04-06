import { useState, type FormEvent } from 'react'
import type { LoginRequestDto } from '@/api/User/authApi'
import { AuthInput } from '@/features/User/components/AuthInput'
import { AuthSubmitButton } from '@/features/User/components/AuthSubmitButton'
import {
  CheckIcon,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  PhoneIcon,
} from '@/features/User/components/AuthIcons'

interface LoginFormProps {
  onSubmit: (payload: LoginRequestDto) => void | Promise<void>
  isLoading: boolean
  onGoRegister: () => void
}

export const LoginForm = ({ onSubmit, isLoading, onGoRegister }: LoginFormProps) => {
  const [form, setForm] = useState<LoginRequestDto>({
    Account: '',
    Password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void onSubmit({
      Account: form.Account.trim(),
      Password: form.Password,
    })
  }

  return (
    <>
      <header className="mb-8 text-center">
        <h1 className="text-[26px] font-bold tracking-tight text-slate-900">
          登录 <span className="font-semibold text-slate-400">Simple Live</span>
        </h1>
      </header>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <AuthInput
          id="account"
          type="text"
          required
          autoComplete="username"
          disabled={isLoading}
          value={form.Account}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, Account: event.target.value }))
          }
          placeholder="请输入手机号/邮箱"
          leftIcon={<PhoneIcon className="h-4 w-4" />}
        />

        <AuthInput
          id="password"
          type={showPassword ? 'text' : 'password'}
          required
          autoComplete="current-password"
          disabled={isLoading}
          value={form.Password}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, Password: event.target.value }))
          }
          placeholder="请输入密码"
          leftIcon={<LockIcon className="h-4 w-4" />}
          rightSlot={
            <button
              type="button"
              disabled={isLoading}
              onClick={() => setShowPassword((prev) => !prev)}
              className="text-slate-400 transition-colors hover:text-slate-600 disabled:cursor-not-allowed"
              aria-label={showPassword ? '隐藏密码' : '显示密码'}
            >
              {showPassword ? (
                <EyeIcon className="h-4 w-4" />
              ) : (
                <EyeOffIcon className="h-4 w-4" />
              )}
            </button>
          }
        />

        <div className="mt-4 flex items-center justify-between">
          <label className="group flex cursor-pointer items-center gap-2 text-[13px] text-slate-500">
            <span className="relative flex items-center justify-center">
              <input
                type="checkbox"
                checked={rememberMe}
                disabled={isLoading}
                onChange={(event) => setRememberMe(event.target.checked)}
                className="peer sr-only"
              />
              <span className="h-4 w-4 rounded border border-slate-300 bg-white transition-all peer-checked:border-slate-900 peer-checked:bg-slate-900" />
              <CheckIcon className="pointer-events-none absolute h-2.5 w-2.5 text-white opacity-0 transition-opacity peer-checked:opacity-100" />
            </span>
            <span className="transition-colors group-hover:text-slate-700">记住登录</span>
          </label>

          <button
            type="button"
            className="text-[13px] font-medium text-slate-900 transition-all hover:underline hover:underline-offset-4"
          >
            忘记密码
          </button>
        </div>

        <AuthSubmitButton
          isLoading={isLoading}
          loadingText="登录中..."
          idleText="立即登录"
        />
      </form>

      <footer className="mt-8 text-center text-[13px] text-slate-500">
        还没有账号?{' '}
        <button
          type="button"
          disabled={isLoading}
          onClick={onGoRegister}
          className="font-semibold text-slate-900 transition-all hover:underline hover:underline-offset-4"
        >
          立即注册
        </button>
      </footer>
    </>
  )
}

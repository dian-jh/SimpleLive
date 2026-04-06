import { useState, type FormEvent } from 'react'
import type { RegisterRequestDto } from '@/api/User/authApi'
import { AuthInput } from '@/features/User/components/AuthInput'
import { AuthSubmitButton } from '@/features/User/components/AuthSubmitButton'
import {
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  PhoneIcon,
} from '@/features/User/components/AuthIcons'

interface RegisterFormProps {
  onSubmit: (payload: RegisterRequestDto) => void | Promise<void>
  isLoading: boolean
  onGoLogin: () => void
}

interface RegisterFormState {
  account: string
  password: string
  confirmPassword: string
}

const INITIAL_STATE: RegisterFormState = {
  account: '',
  password: '',
  confirmPassword: '',
}

export const RegisterForm = ({ onSubmit, isLoading, onGoLogin }: RegisterFormProps) => {
  const [form, setForm] = useState<RegisterFormState>(INITIAL_STATE)
  const [errorText, setErrorText] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const passwordHint =
    form.password.length > 0 && form.password.length < 6
      ? '密码长度至少 6 位'
      : '建议使用字母 + 数字组合，安全性更高'

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const account = form.account.trim()
    if (!account) {
      setErrorText('请输入手机号或邮箱')
      return
    }

    if (form.password.length < 6) {
      setErrorText('密码长度不能少于 6 位')
      return
    }

    if (form.password !== form.confirmPassword) {
      setErrorText('两次输入的密码不一致')
      return
    }

    setErrorText(null)
    const isEmail = account.includes('@')
    void onSubmit({
      UserName: isEmail ? undefined : account,
      Email: isEmail ? account : undefined,
      Password: form.password,
    })
  }

  return (
    <>
      <header className="mb-8 text-center">
        <h1 className="text-[26px] font-bold tracking-tight text-slate-900">注册新账号</h1>
      </header>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <AuthInput
          id="register-account"
          type="text"
          required
          disabled={isLoading}
          value={form.account}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, account: event.target.value }))
          }
          placeholder="请输入手机号/邮箱"
          leftIcon={<PhoneIcon className="h-4 w-4" />}
        />

        <AuthInput
          id="register-password"
          type={showPassword ? 'text' : 'password'}
          required
          minLength={6}
          autoComplete="new-password"
          disabled={isLoading}
          value={form.password}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, password: event.target.value }))
          }
          placeholder="请设置密码"
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

        <AuthInput
          id="confirm-password"
          type={showConfirmPassword ? 'text' : 'password'}
          required
          minLength={6}
          autoComplete="new-password"
          disabled={isLoading}
          value={form.confirmPassword}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, confirmPassword: event.target.value }))
          }
          placeholder="请确认密码"
          leftIcon={<LockIcon className="h-4 w-4" />}
          rightSlot={
            <button
              type="button"
              disabled={isLoading}
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="text-slate-400 transition-colors hover:text-slate-600 disabled:cursor-not-allowed"
              aria-label={showConfirmPassword ? '隐藏确认密码' : '显示确认密码'}
            >
              {showConfirmPassword ? (
                <EyeIcon className="h-4 w-4" />
              ) : (
                <EyeOffIcon className="h-4 w-4" />
              )}
            </button>
          }
        />

        <p
          className={`min-h-5 text-xs ${
            errorText
              ? 'text-rose-500'
              : form.password.length > 0 && form.password.length < 6
                ? 'text-amber-500'
                : 'text-slate-500'
          }`}
        >
          {errorText ?? passwordHint}
        </p>

        <AuthSubmitButton
          isLoading={isLoading}
          loadingText="注册中..."
          idleText="确认注册"
        />
      </form>

      <footer className="mt-8 text-center text-[13px] text-slate-500">
        已有账号?{' '}
        <button
          type="button"
          disabled={isLoading}
          onClick={onGoLogin}
          className="font-semibold text-slate-900 transition-all hover:underline hover:underline-offset-4"
        >
          登录
        </button>
      </footer>
    </>
  )
}

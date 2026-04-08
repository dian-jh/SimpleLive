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
  Account: string
  password: string
  confirmPassword: string
}

const INITIAL_STATE: RegisterFormState = {
  Account: '',
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
      : '密码至少包含数字+字母'

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const account = form.Account.trim()
    if (!account) {
      setErrorText('请输入账号或邮箱')
      return
    }

    // --- 1. 账号/邮箱的前端格式校验 ---
    const isEmail = account.includes('@')
    if (isEmail) {
      // 邮箱格式基础正则验证
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(account)) {
        setErrorText('邮箱格式不正确')
        return
      }
    } else {
      // 用户名正则验证 (直接复用后端的规则：6-20位，包含字母和数字...)
      const userNameRegex = /^(?=.{6,20}$)(?=.*[A-Za-z])(?=.*\d)[A-Za-z0-9][A-Za-z0-9._-]*$/
      if (!userNameRegex.test(account)) {
        setErrorText('用户名必须为6-20位，包含字母和数字，且以字母或数字开头')
        return
      }
    }

    // --- 2. 密码的前端格式校验 (与后端同步对齐) ---
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/
    if (!passwordRegex.test(form.password)) {
      setErrorText('密码至少6位，且必须包含字母和数字')
      return
    }

    if (form.password !== form.confirmPassword) {
      setErrorText('两次输入的密码不一致')
      return
    }

    // --- 3. 校验全部通过，清理报错并组装提交数据 ---
    setErrorText(null)

    // 直接传入 Account 和 Password，把判断到底是邮箱还是用户名的重任交给后端
    void onSubmit({
      Account: account,
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
          value={form.Account}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, Account: event.target.value }))
          }
          placeholder="请输入账号/邮箱"
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
          className={`min-h-5 text-xs ${errorText
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

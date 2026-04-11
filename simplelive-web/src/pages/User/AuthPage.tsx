import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import type { LoginRequestDto, RegisterRequestDto } from '@/api/User/authApi'
import { AuthLayout } from '@/features/User/components/AuthLayout'
import { LoginForm } from '@/features/User/components/LoginForm'
import { RegisterForm } from '@/features/User/components/RegisterForm'
import { useAuth } from '@/features/User/hooks/useAuth'
import { AnimatePresence, motion } from 'framer-motion'

type AuthMode = 'login' | 'register'
interface AuthRouteState {
  from?: string
}

const transition = {
  duration: 0.3,
  ease: [0.16, 1, 0.3, 1] as const,
}

const AuthPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [mode, setMode] = useState<AuthMode>('login')
  const { isLoading, login, register } = useAuth()

  const handleLogin = async (payload: LoginRequestDto) => {
    const success = await login(payload)
    if (success) {
      const routeState = (location.state ?? null) as AuthRouteState | null
      const backTo = routeState?.from || '/live'
      navigate(backTo, { replace: true })
    }
  }

  const handleRegister = async (payload: RegisterRequestDto) => {
    const success = await register(payload)
    if (success) {
      setMode('login')
    }
  }

  return (
    <AuthLayout>
      <AnimatePresence mode="wait" initial={false}>
        {mode === 'login' ? (
          <motion.div
            key="login"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={transition}
          >
            <LoginForm
              onSubmit={handleLogin}
              isLoading={isLoading}
              onGoRegister={() => setMode('register')}
            />
          </motion.div>
        ) : (
          <motion.div
            key="register"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={transition}
          >
            <RegisterForm
              onSubmit={handleRegister}
              isLoading={isLoading}
              onGoLogin={() => setMode('login')}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </AuthLayout>
  )
}

export default AuthPage

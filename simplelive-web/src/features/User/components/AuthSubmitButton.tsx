interface AuthSubmitButtonProps {
  isLoading: boolean
  loadingText: string
  idleText: string
}

const BASE_BUTTON_CLASS =
  'mt-8 w-full rounded-2xl bg-slate-900 px-4 py-4 text-[15px] font-semibold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-300 disabled:cursor-not-allowed disabled:bg-slate-500'

export const AuthSubmitButton = ({
  isLoading,
  loadingText,
  idleText,
}: AuthSubmitButtonProps) => {
  return (
    <button type="submit" disabled={isLoading} className={BASE_BUTTON_CLASS}>
      {isLoading ? loadingText : idleText}
    </button>
  )
}

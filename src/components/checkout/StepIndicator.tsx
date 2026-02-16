import { STEPS } from './constants'

export default function StepIndicator({ currentIndex }: { currentIndex: number }) {
  return (
    <nav aria-label="Checkout progress" className="relative">
      <div className="flex items-center justify-between max-w-2xl mx-auto">
        {STEPS.map((step, i) => {
          const isCompleted = i < currentIndex
          const isCurrent = i === currentIndex

          return (
            <div key={step.key} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center relative z-10">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-500 ease-[var(--ease-yarn-pull)] ${
                    isCompleted
                      ? 'bg-gold text-burgundy-deep'
                      : isCurrent
                      ? 'bg-burgundy text-gold-pale ring-4 ring-burgundy/20'
                      : 'bg-dust/40 text-rosewood'
                  }`}
                >
                  {isCompleted ? (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    step.number
                  )}
                </div>
                <span
                  className={`text-xs mt-2 font-medium whitespace-nowrap transition-colors duration-300 ${
                    isCompleted
                      ? 'text-gold-muted'
                      : isCurrent
                      ? 'text-burgundy'
                      : 'text-dust'
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {i < STEPS.length - 1 && (
                <div className="flex-1 h-[2px] mx-3 mt-[-1.25rem] relative">
                  <div className="absolute inset-0 bg-dust/30 rounded-full" />
                  <div
                    className="absolute inset-y-0 left-0 bg-gold rounded-full transition-all duration-700 ease-[var(--ease-yarn-pull)]"
                    style={{
                      width: isCompleted ? '100%' : '0%',
                    }}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </nav>
  )
}

import { STATUS_CONFIG, type ReadingStatus } from "@/types/book"

interface StatusBadgeProps {
  status: ReadingStatus
  className?: string
}

export default function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status]

  return (
    <span
      className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${config.badgeColor} ${className}`}
      title={config.description}
    >
      {config.label}
    </span>
  )
}

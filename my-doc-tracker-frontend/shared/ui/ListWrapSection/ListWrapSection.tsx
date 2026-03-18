import type { ReactNode } from "react"
import styles from "./ListWrapSection.module.scss"
import { CardSkeleton } from "../CardSkeleton"

interface ListWrapSectionProps {
  title: string
  action?: ReactNode
  isLoading?: boolean
  isError?: boolean
  isEmpty?: boolean
  skeletonCount?: number
  errorMessage?: string
  emptyMessage?: string
  emptyIcon?: string
  errorIcon?: string
  skeleton?: ReactNode
  children: ReactNode
}

export const ListWrapSection = ({
  title,
  action,
  isLoading = false,
  isError = false,
  isEmpty = false,
  skeletonCount = 5,
  errorMessage = "Не удалось загрузить данные",
  emptyMessage = "Здесь пока ничего нет",
  emptyIcon = "📭",
  errorIcon = "😕",
  children,
}: ListWrapSectionProps) => {

  const renderSkeletons = () => {
    return Array.from({ length: skeletonCount }).map((_, i) => (
      <CardSkeleton />
    ))
  }

  return (
    <section className={styles.ListWrapSection}>
      <div className={styles.ListWrapSection__header}>
        <h2 className={styles.ListWrapSection__title}>{title}</h2>
        {action && (
          <div className={styles.ListWrapSection__action}>{action}</div>
        )}
      </div>

      <div className={styles.ListWrapSection__body}>

        {isLoading && renderSkeletons()}

        {isError && !isLoading && (
          <div className={styles.ListWrapSection__state}>
            <span>{errorIcon}</span>
            <p>{errorMessage}</p>
          </div>
        )}

        {!isLoading && !isError && isEmpty && (
          <div className={styles.ListWrapSection__state}>
            <span>{emptyIcon}</span>
            <p>{emptyMessage}</p>
          </div>
        )}

        {!isLoading && !isError && !isEmpty && children}

      </div>
    </section>
  )
}

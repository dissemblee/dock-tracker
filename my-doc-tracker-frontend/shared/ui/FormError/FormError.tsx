import { FiAlertCircle } from "react-icons/fi"
import styles from "./FormError.module.scss"

interface FormErrorProps {
  message: string | null
}

export const FormError = ({ message }: FormErrorProps) => {
  if (!message) return null

  return (
    <div className={styles.formError}>
      <FiAlertCircle className={styles.formError__icon} />
      <span>{message}</span>
    </div>
  )
}
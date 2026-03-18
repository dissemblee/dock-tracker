import { useCallback, useEffect, useState } from "react"

type ValidateFn<T> = (values: T) => Partial<Record<keyof T, string>>

interface UseFormOptions<T> {
  initialValues: T
  validate?: ValidateFn<T>
  onSubmit: (values: T) => void | Promise<void>
}

export const useForm = <T extends Record<string, any>>(options: UseFormOptions<T>) => {
  const { initialValues, validate, onSubmit } = options

  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({})
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({})
  const [isSubmitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
    setSubmitError(null)
  }, [JSON.stringify(initialValues)])

  const validateAll = useCallback(
    (vals: T) => {
      if (!validate) return {}
      const e = validate(vals)
      setErrors(e)
      return e
    },
    [validate]
  )

  const validateField = useCallback(
    (name: keyof T, value: any) => {
      if (!validate) return
      const next = { ...values, [name]: value }
      const e = validate(next)
      setErrors(e)
    },
    [validate, values]
  )

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target
      const field = name as keyof T

      const nextValue =
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value

      setValues((prev) => ({ ...prev, [field]: nextValue }))

      if (submitError) setSubmitError(null)

      if (touched[field]) {
        validateField(field, nextValue)
      }
    },
    [touched, validateField, submitError]
  )

  const handleBlur = useCallback(
    (e: React.FocusEvent<any>) => {
      const field = e.target.name as keyof T
      setTouched((prev) => ({ ...prev, [field]: true }))
      validateField(field, values[field])
    },
    [values, validateField]
  )

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setSubmitError(null)

      const validationErrors = validateAll(values)
      const hasErrors = Object.values(validationErrors).some(Boolean)
      if (hasErrors) return

      setSubmitting(true)
      try {
        await onSubmit(values)
      } catch (err: any) {
        const message =
          err?.data?.error?.message ||
          err?.error?.data?.error?.message ||
          err?.message ||
          "Что-то пошло не так. Попробуйте ещё раз."
        setSubmitError(message)
      } finally {
        setSubmitting(false)
      }
    },
    [values, validateAll, onSubmit]
  )

  const field = useCallback(
    (name: keyof T) => ({
      name,
      value: values[name],
      onChange: handleChange,
      onBlur: handleBlur,
      error: errors[name],
    }),
    [values, errors, touched, handleChange, handleBlur]
  )

  return {
    values,
    errors,
    touched,
    isSubmitting,
    submitError,
    setSubmitError,
    handleChange,
    handleBlur,
    handleSubmit,
    field,
    setValues,
    setErrors,
  }
}

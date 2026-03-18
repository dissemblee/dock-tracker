import type {
  TextareaHTMLAttributes,
  SelectHTMLAttributes,
  InputHTMLAttributes,
  ReactElement,
  DragEvent,
  ChangeEvent
} from "react"
import { useState, useRef } from "react"
import styled from './Inputs.module.scss'
import { FiUpload, FiX, FiCheck, FiArchive } from "react-icons/fi"

interface BaseInputProps {
  label: string
  error?: string
  icon?: ReactElement<any, any>
}

interface InputProps extends BaseInputProps, InputHTMLAttributes<HTMLInputElement> {}

export const Input = ({ label, error, className, icon, ...props }: InputProps) => {
  const fieldClasses = [
    styled.Input__field,
    styled.Input__field_text,
    error && styled.Input__field_error,
    className
  ].filter(Boolean).join(' ')

  return (
    <div className={styled.Input}>
      <label htmlFor={props.id} className={styled.Input__label}>
        {icon ? icon : null} {label}
      </label>
      <div style={{display: 'flex'}}>
        <input 
          {...props} 
          className={fieldClasses}
        />
      </div>
      {error && <div className={styled.Input__error}>{error}</div>}
    </div>
  )
}

interface TextareaProps extends BaseInputProps, TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = ({ label, error, className, icon, ...props }: TextareaProps) => {
  const fieldClasses = [
    styled.Input__field,
    styled.Input__field_textarea,
    error && styled.Input__field_error,
    className
  ].filter(Boolean).join(' ')

  return (
    <div className={styled.Input}>
      <label htmlFor={props.id} className={styled.Input__label}>
        {icon ? icon : null} {label}
      </label>
      <textarea 
        {...props} 
        className={fieldClasses}
      />
      {error && <div className={styled.Input__error}>{error}</div>}
    </div>
  )
}

interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends BaseInputProps, Omit<SelectHTMLAttributes<HTMLSelectElement>, 'options'> {
  options: SelectOption[]
}

export const Select = ({ label, error, options, icon, className, ...props }: SelectProps) => {
  const fieldClasses = [
    styled.Input__field,
    styled.Input__field_select,
    error && styled.Input__field_error,
    className
  ].filter(Boolean).join(' ')

  return (
    <div className={styled.Input}>
      <label htmlFor={props.id} className={styled.Input__label}>
        {icon ? icon : null} {label}
      </label>
      <select {...props} className={fieldClasses}>
        <option value="">Выберите опцию</option>
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <div className={styled.Input__error}>{error}</div>}
    </div>
  )
}

interface CheckboxProps extends BaseInputProps, Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {}

export const Checkbox = ({ label, error, className, ...props }: CheckboxProps) => {
  const wrapperClasses = [
    styled.Input,
    styled.Input_checkbox,
    className
  ].filter(Boolean).join(' ')

  return (
    <div className={wrapperClasses}>
      <label className={styled.Input__checkboxLabel}>
        <input 
          type="checkbox" 
          className={styled.Input__checkbox}
          {...props} 
        />
        <span className={styled.Input__checkboxText}>{label}</span>
      </label>
      {error && <div className={styled.Input__error}>{error}</div>}
    </div>
  )
}

interface FileInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange'> {
  label: string
  error?: string
  icon?: ReactElement
  value?: File | null
  onChange?: (file: File | null) => void
  acceptedFileTypes?: string[]
  maxSize?: number
}

export const FileInput = ({
  label,
  error,
  icon,
  value,
  onChange,
  acceptedFileTypes = ['.zip', '.rar', '.7z', '.tar', '.gz', '.tgz'],
  maxSize = 10 * 1024 * 1024,
  className,
  ...props
}: FileInputProps) => {
  const [isDragging, setIsDragging] = useState(false)
  const [fileError, setFileError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const validateFile = (file: File): string | null => {
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!acceptedFileTypes.includes(fileExtension)) {
      return `Допустимые форматы: ${acceptedFileTypes.join(', ')}`
    }
    if (file.size > maxSize) {
      return `Размер файла не должен превышать ${maxSize / (1024 * 1024)}MB`
    }
    return null
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      const file = files[0]
      const validationError = validateFile(file)
      if (validationError) {
        setFileError(validationError)
      } else {
        setFileError(null)
        onChange?.(file)
      }
    }
  }

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const file = files[0]
      const validationError = validateFile(file)
      if (validationError) {
        setFileError(validationError)
      } else {
        setFileError(null)
        onChange?.(file)
      }
    }
    e.target.value = ''
  }

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onChange?.(null)
    setFileError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleZoneClick = () => {
    if (value) return
    fileInputRef.current?.click()
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }

  const wrapperClasses = [
    styled.FileInput,
    isDragging && styled.FileInput_dragging,
    (error || fileError) ? styled.FileInput_error : '',
    className
  ].filter(Boolean).join(' ')

  return (
    <div className={wrapperClasses}>
      <label className={styled.FileInput__label}>
        {icon ? icon : <FiArchive />} {label}
      </label>

      <input
        ref={fileInputRef}
        type="file"
        className={styled.FileInput__input}
        onChange={handleFileSelect}
        accept={acceptedFileTypes.join(',')}
        {...props}
      />

      <div
        className={styled.FileInput__dropzone}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleZoneClick}
      >
        {!value ? (
          <div className={styled.FileInput__placeholder}>
            <FiUpload className={styled.FileInput__uploadIcon} />
            <div className={styled.FileInput__title}>
              {isDragging ? 'Отпустите файл' : 'Перетащите архив или нажмите для выбора'}
            </div>
            <div className={styled.FileInput__hint}>
              Допустимые форматы: {acceptedFileTypes.join(', ')}
            </div>
            <div className={styled.FileInput__hint}>
              Максимальный размер: {maxSize / (1024 * 1024)}MB
            </div>
          </div>
        ) : (
          <div className={styled.FileInput__fileInfo}>
            <FiArchive className={styled.FileInput__fileIcon} />
            <div className={styled.FileInput__fileDetails}>
              <div className={styled.FileInput__fileName}>{value.name}</div>
              <div className={styled.FileInput__fileSize}>{formatFileSize(value.size)}</div>
            </div>
            <FiCheck className={styled.FileInput__checkIcon} />
            <button
              type="button"
              className={styled.FileInput__removeButton}
              onClick={handleRemoveFile}
            >
              <FiX />
            </button>
          </div>
        )}
      </div>

      {(error || fileError) && (
        <div className={styled.Input__error}>{error || fileError}</div>
      )}
    </div>
  )
}
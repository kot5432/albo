import React from 'react'

interface BaseInputProps {
  label?: string
  error?: string
  onChange?: (value: string) => void
}

interface InputProps extends BaseInputProps, Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  type?: 'text' | 'email' | 'password' | 'date' | 'number'
}

interface TextareaProps extends BaseInputProps, Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  type: 'textarea'
}

export default function Input({ label, error, className = '', onChange, ...props }: InputProps | TextareaProps) {
  const baseClasses = 'w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300'
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (onChange) {
      onChange(e.target.value)
    }
  }
  
  if ('type' in props && props.type === 'textarea') {
    const textareaProps = props as TextareaProps
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-gray-300">
            {label}
          </label>
        )}
        <textarea
          className={`${baseClasses} resize-none ${className}`}
          {...textareaProps}
          onChange={handleChange}
        />
        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}
      </div>
    )
  }
  
  const inputProps = props as InputProps
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-300">
          {label}
        </label>
      )}
      <input
        className={`${baseClasses} ${className}`}
        {...inputProps}
        onChange={handleChange}
      />
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
    </div>
  )
}

import React from 'react'

interface InputProps {
  type?: 'text' | 'email' | 'password' | 'date' | 'textarea'
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  className?: string
  rows?: number
}

const Input = ({ 
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  className = '',
  rows
}: InputProps) => {
  const baseClasses = 'bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200'

  if (type === 'textarea') {
    return (
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className={`${baseClasses} resize-none ${className}`}
        rows={rows || 4}
      />
    )
  }

  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      className={`${baseClasses} ${className}`}
    />
  )
}

export default Input

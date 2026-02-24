import React from 'react'

interface InputProps {
  label?: string
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  type?: 'text' | 'email' | 'password' | 'date' | 'number' | 'textarea'
  error?: string
  className?: string
  rows?: number
}

export default function Input({ 
  label, 
  placeholder, 
  value = '', 
  onChange, 
  type = 'text', 
  error, 
  className = '',
  rows = 3
}: InputProps) {
  const baseClasses = 'w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300'
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (onChange) {
      onChange(e.target.value)
    }
  }

  if (type === 'textarea') {
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-gray-300">
            {label}
          </label>
        )}
        <textarea
          className={`${baseClasses} resize-none ${className}`}
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          rows={rows}
        />
        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-300">
          {label}
        </label>
      )}
      <input
        className={`${baseClasses} ${className}`}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
      />
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
    </div>
  )
}

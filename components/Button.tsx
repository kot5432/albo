import React from 'react'

interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'danger'
  disabled?: boolean
  className?: string
  type?: 'button' | 'submit' | 'reset'
  size?: 'sm' | 'md' | 'lg'
}

const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  disabled = false,
  className = '',
  type = 'button',
  size = 'md'
}: ButtonProps) => {
  const baseClasses = 'font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900'
  
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm rounded-xl',
    md: 'px-6 py-3 text-base rounded-2xl',
    lg: 'px-8 py-4 text-lg rounded-2xl'
  }
  
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-500 text-white focus:ring-blue-500 shadow-lg hover:shadow-xl',
    secondary: 'bg-gray-700 hover:bg-gray-600 text-white focus:ring-gray-500',
    danger: 'bg-red-600 hover:bg-red-500 text-white focus:ring-red-500'
  }

  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed transform-none' : ''

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${disabledClasses} ${className}`}
    >
      {children}
    </button>
  )
}

export default Button

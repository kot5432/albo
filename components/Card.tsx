import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  variant?: 'default' | 'elevated' | 'glass'
}

const Card = ({ children, className = '', onClick, variant = 'default' }: CardProps) => {
  const baseClasses = 'transition-all duration-200'
  
  const variantClasses = {
    default: 'bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-700 hover:shadow-2xl',
    elevated: 'bg-gray-800 rounded-2xl p-8 shadow-2xl border border-gray-700 hover:shadow-3xl transform hover:-translate-y-1',
    glass: 'bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-gray-700/50 hover:shadow-2xl'
  }

  return (
    <div 
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

export default Card

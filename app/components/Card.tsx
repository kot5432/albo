import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'elevated' | 'subtle' | 'glass'
}

export default function Card({ children, className = '', variant = 'default' }: CardProps) {
  const baseClasses = 'rounded-2xl p-8 transition-all duration-300'
  
  const variants = {
    default: 'bg-gray-900 border border-gray-800',
    elevated: 'bg-gray-900 border border-gray-800 shadow-xl',
    subtle: 'bg-gray-800 border border-gray-700',
    glass: 'bg-gray-900/50 backdrop-blur-sm border border-gray-800/50'
  }
  
  return (
    <div className={`${baseClasses} ${variants[variant]} ${className}`}>
      {children}
    </div>
  )
}

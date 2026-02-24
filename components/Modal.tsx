import React from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const Modal = ({ isOpen, onClose, children, className = '', size = 'md' }: ModalProps) => {
  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl'
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div 
        className={`bg-gray-800 rounded-2xl p-8 w-full ${sizeClasses[size]} max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-700 transform transition-all duration-300 ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}

export default Modal

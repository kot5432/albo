import React, { useState } from 'react'

interface ThinkingBoxProps {
  title: string
  placeholder?: string
  onSubmit: (content: string) => void
  buttonText?: string
}

export default function ThinkingBox({ title, placeholder, onSubmit, buttonText = "考える" }: ThinkingBoxProps) {
  const [content, setContent] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)

  const handleSubmit = () => {
    if (content.trim()) {
      onSubmit(content)
      setContent('')
      setIsExpanded(false)
    }
  }

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-400 hover:text-gray-300 text-sm"
        >
          {isExpanded ? '閉じる' : '開く'}
        </button>
      </div>
      
      {isExpanded && (
        <div className="space-y-4">
          <textarea
            className="w-full h-32 bg-gray-700 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={placeholder || '深く考えてみましょう...'}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <div className="flex gap-4">
            <button
              onClick={() => setIsExpanded(false)}
              className="btn-secondary"
            >
              キャンセル
            </button>
            <button
              onClick={handleSubmit}
              disabled={!content.trim()}
              className="btn-primary"
            >
              {buttonText}
            </button>
          </div>
        </div>
      )}
      
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="w-full text-center text-gray-400 hover:text-gray-300 py-2"
        >
          {placeholder || '考え始める...'}
        </button>
      )}
    </div>
  )
}

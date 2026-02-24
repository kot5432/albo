interface MotivationalQuoteProps {
  text: string
  author?: string
}

export default function MotivationalQuote({ text, author }: MotivationalQuoteProps) {
  return (
    <div className="text-center italic text-gray-400 text-lg mb-8">
      <p className="text-white font-medium">"{text}"</p>
      {author && (
        <p className="text-gray-500 text-sm mt-2">— {author}</p>
      )}
    </div>
  )
}

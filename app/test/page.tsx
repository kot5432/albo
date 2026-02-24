export default function TestPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-8">テストページ</h1>
        <p className="mb-8">このページが表示されたらルーティングは正常です</p>
        <a href="/" className="text-blue-400 hover:text-blue-300">
          ホームに戻る
        </a>
      </div>
    </div>
  )
}

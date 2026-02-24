import { NextResponse } from "next/server"

export async function GET() {
  // Realistic stats for a single-user demo app
  // In a real multi-user app, this would query the database
  
  const stats = {
    activeCount: 1, // あなたが現在挑戦中
    firstActionCount: 1, // あなたが初動中の場合
  }

  return NextResponse.json(stats)
}

import { NextResponse } from 'next/server'

export async function GET() {
  const users = [{ id: 1, name: 'John Doe' }]
  return NextResponse.json(users)
}

export async function POST(request: Request) {
  const data = await request.json()
  // handle new user creation
  return NextResponse.json({ message: 'User created', data })
}

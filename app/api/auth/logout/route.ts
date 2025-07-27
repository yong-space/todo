import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // With localStorage, logout is handled client-side
    // Just return success
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
  }
}

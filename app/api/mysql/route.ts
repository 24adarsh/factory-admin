import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    { error: 'MySQL API has been disabled. Please use DynamoDB instead.' },
    { status: 410 }
  );
}


import { NextResponse } from 'next/server';
import { loadAllIntents } from '@/lib/context/intentData';

export async function GET() {
  try {
    const allIntents = await loadAllIntents();

    if (!allIntents || allIntents.length === 0) {
      return NextResponse.json({ error: 'No intents found.' }, { status: 404 });
    }

    const randomIndex = Math.floor(Math.random() * allIntents.length);
    const randomIntent = allIntents[randomIndex];

    return NextResponse.json(randomIntent, { status: 200 });
  } catch (error) {
    console.error('Error loading intents:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
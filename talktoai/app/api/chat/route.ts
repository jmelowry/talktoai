// File: app/api/chat.ts

import type { NextRequest } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const body = await req.json();
    const { apiKey, message } = body;

    // Initialize OpenAI client with the provided API key
    const client = new OpenAI({ apiKey });

    // Send the message to OpenAI
    const response = await client.chat.completions.create({
      model: 'gpt-3.5-turbo', // or any other model you prefer
      messages: [{ role: 'user', content: message }],
    });

    // Extract the AI response
    const aiResponse = response.choices[0]?.message?.content || '';

    // Return the AI response
    return new Response(JSON.stringify({ aiResponse }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    // Handle any errors
    console.error('Error processing chat request:', error);
    return new Response(JSON.stringify({ error: 'Error processing request' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

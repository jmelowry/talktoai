// File: app/api/chat.ts

import type { NextRequest } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const body = await req.json();
    const { apiKey, model, userMessage, initialSystemPrompt } = body;

    // Log the request details for debugging
    console.log('Received Request:', {
      // if key is entered, include asterisks
      apiKey: apiKey ? '********' : null,
      model: model,
      userMessage: userMessage,
      initialSystemPrompt: initialSystemPrompt
    });

    // Initialize OpenAI client with the provided API key
    const client = new OpenAI({ apiKey });

    // Prepare the messages array including the initial system prompt and the user message
    const messages = [
      { role: 'system', content: initialSystemPrompt },
      { role: 'user', content: userMessage }
    ];

    // Send the message to OpenAI
    const response = await client.chat.completions.create({
      model: model,
      messages: messages,
    });

    // Extract the AI response
    const aiResponse = response.choices[0]?.message?.content || '';

    // Return the AI response
    return new Response(JSON.stringify({ aiResponse }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error processing chat request:', error);
    return new Response(JSON.stringify({ error: 'Error processing request' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

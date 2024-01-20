import { NextApiRequest } from 'next';
import { cookies } from 'next/headers'
import React from 'react';

export async function POST(request: Request) {
  try {
    console.log('Received request to validate API key');

    // Extract API key from the request body
    const requestBody = await request.json();
    const apiKey = requestBody.apiKey;

    // Log the received API key (optional, be cautious with sensitive data)
    console.log('API Key received:');

    // Perform your API key validation logic...
    const response = await fetch('https://api.openai.com/v1/engines', {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    // Check if the response is OK and log the result
    if (response.ok) {
      return new Response(JSON.stringify({ valid: true }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } else {
      return new Response(JSON.stringify({ valid: false }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
  } catch (error) {
    // Handle errors and return JSON response
    return new Response(JSON.stringify({ error: 'Error validating API key' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { SYSTEM_PROMPT } from '@/config/prompts';

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY
});

export async function POST(request: Request) {
    if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
        return new NextResponse(
            JSON.stringify({ error: 'OpenAI API key not configured' }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }

    try {
        const body = await request.json();
        const { messages, contextPrompt } = body;

        if (!messages || !contextPrompt) {
            return new NextResponse(
                JSON.stringify({ error: 'Missing required fields' }),
                {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: SYSTEM_PROMPT
                },
                {
                    role: "system",
                    content: contextPrompt
                },
                ...messages
            ],
            temperature: 0.7,
            max_tokens: 500
        });

        if (!completion.choices[0]?.message?.content) {
            throw new Error('No response from OpenAI');
        }

        return new NextResponse(
            JSON.stringify({ response: completion.choices[0].message.content }),
            {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            }
        );

    } catch (error) {
        console.error('API Route Error:', error);
        return new NextResponse(
            JSON.stringify({
                error: 'Internal Server Error',
                details: error instanceof Error ? error.message : 'Unknown error'
            }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}

// Add OPTIONS handler for CORS
export async function OPTIONS() {
    return NextResponse.json({}, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
} 
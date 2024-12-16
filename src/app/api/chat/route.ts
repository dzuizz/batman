import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { SYSTEM_PROMPT } from '@/config/prompts';

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY
});

// Store chat histories in memory (in production, use a database)
const chatHistories = new Map<string, Array<{ role: string, content: string }>>();

export async function POST(request: Request) {
    if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
        return new NextResponse(
            JSON.stringify({ error: 'OpenAI API key not configured' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }

    try {
        const body = await request.json();
        const { messages, contextPrompt, sessionId } = body;

        if (!messages || !contextPrompt || !sessionId) {
            return new NextResponse(
                JSON.stringify({
                    error: 'Missing required fields',
                    message: 'Required fields are missing from the request'
                }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Get or initialize chat history
        if (!chatHistories.has(sessionId)) {
            chatHistories.set(sessionId, []);
        }
        const history = chatHistories.get(sessionId)!;

        try {
            const completion = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: SYSTEM_PROMPT },
                    { role: "system", content: contextPrompt },
                    ...history,
                    ...messages
                ],
                temperature: 0.7,
                max_tokens: 500
            });

            if (!completion.choices[0]?.message?.content) {
                throw new Error('OpenAI returned an empty response');
            }

            // Update chat history
            history.push(...messages);
            history.push({
                role: 'assistant',
                content: completion.choices[0].message.content
            });

            if (history.length > 10) {
                chatHistories.set(sessionId, history.slice(-10));
            }

            return new NextResponse(
                JSON.stringify({
                    response: completion.choices[0].message.content,
                    status: 'success'
                }),
                { status: 200, headers: { 'Content-Type': 'application/json' } }
            );
        } catch (openAiError) {
            console.error('OpenAI API Error:', openAiError);
            return new NextResponse(
                JSON.stringify({
                    error: 'OpenAI API Error',
                    message: openAiError instanceof Error ? openAiError.message : 'Failed to get AI response'
                }),
                { status: 503, headers: { 'Content-Type': 'application/json' } }
            );
        }
    } catch (error) {
        console.error('Request Processing Error:', error);
        return new NextResponse(
            JSON.stringify({
                error: 'Request Processing Error',
                message: error instanceof Error ? error.message : 'Failed to process request'
            }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
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
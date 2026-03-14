import { NextRequest, NextResponse } from 'next/server';
import { getConfig } from '@/lib/config';

export async function POST(req: NextRequest) {
    const config = getConfig();
    const apiKey = config.settings?.openRouterApiKey;

    if (!apiKey) {
        return NextResponse.json({ error: 'OpenRouter API key is not configured. Please add it in Settings.' }, { status: 400 });
    }

    try {
        const body = await req.json();
        const { text, type, title } = body;

        if (!text) {
            return NextResponse.json({ error: 'Missing text to refine' }, { status: 400 });
        }

        const systemPrompt = `You are an AI assistant that helps refine software project tasks.
The user will provide a raw description, title, and type.
If the type is "Feature", format the output EXACTLY matching this structure:

### Context
<A clear, professional context and background based on the user's input>

### Business Rules
\`\`\`gherkin
Feature: <Feature title>
  Scenario: <A refined scenario based on the input>
    Given <precondition>
    When <action>
    Then <expected result>
<add more scenarios if appropriate>
\`\`\`

If it's not a Feature, output a professional, structured overview and a checklist of "Implementation Tasks".
Return ONLY the polished markdown, no conversational filler.`;

        const userPrompt = `Type: ${type}\nTitle: ${title}\nRaw Text:\n${text}`;

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': 'http://localhost:3000', // Required by OpenRouter
                'X-Title': 'BrainBoard Local App', // Required by OpenRouter
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'openrouter/free',
                max_tokens: 2000,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ]
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData?.error?.message || `OpenRouter API error: ${response.statusText}`);
        }

        const data = await response.json();
        const refinedText = data.choices[0].message.content;

        return NextResponse.json({ refinedText });
    } catch (err: any) {
        console.error('AI Refine Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

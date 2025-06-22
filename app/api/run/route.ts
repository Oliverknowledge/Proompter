import { NextRequest, NextResponse } from 'next/server';
import { Opik } from 'opik';
import OpenAI from 'openai';
import { supabase } from '@/supabase/client';

const openai = new OpenAI({ apiKey: process.env.CHATGPT });

const opikClient = new Opik({
  apiKey: process.env.OPIK_API_KEY,
  apiUrl: 'https://www.comet.com/opik/api',
  projectName: 'proompter',
  workspaceName: 'ivan-top',
});

export async function POST(req: NextRequest) {
  try {
    // Expect user_id and team_code in the request body
    const body = await req.json();
    console.log('Received body:', body);
    const { task, prompts, user_id, team_code } = body;
    if (!task || !Array.isArray(prompts) || !user_id || !team_code) {
      
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }
    const results = [];
    for (const prompt of prompts) {
      const trace = opikClient.trace({
        name: 'RunPrompt',
        input: { task, prompt },
      });
      const start = Date.now();
      const res = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: `Task: ${task}` },
          { role: 'user', content: prompt },
        ],
      });
      const latency = Date.now() - start;
      const output = res.choices[0].message.content;
      const tokens = res.usage?.total_tokens || 0;
      const cost = tokens * 0.00001; // Example cost calculation, adjust as needed
      trace.span({
        name: 'llm',
        type: 'llm',
        input: { task, prompt },
        output: { response: output, latency, tokens, cost },
      });
      results.push({ prompt, output, latency, tokens });

      // Save generation to Supabase
      const {data, error} = await supabase.from('prompt_history').insert({
        prompt_text: prompt,
        response_text: output,
        score: null, // No score at generation step
        experiment_name: '', // Optionally pass from frontend
        user_id, // Use actual user_id
        team_code, // Use actual team_code
        // Add latency and tokens as custom columns if your table supports them
        // latency,
        // tokens, 
      });
      console.log(error)
      
    }
    await opikClient.flush();
    console.log(results)
    return NextResponse.json({prompts: results});
  } catch (err: unknown) {
    return NextResponse.json({ error: err || 'Internal error' }, { status: 500 });
  }
} 
// File: app/api/optimize/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import path from 'path';
import { promisify } from 'util';
import fs from 'fs';
import { supabase } from '@/supabase/client';
import { telegramBot } from '@/lib/telegram';

const execAsync = promisify(exec);

interface PromptObject {
  id: string;
  prompt: string;
  output?: string;
}

interface Trial {
  prompt: PromptObject;
  response?: string;
  score: number;
  hallucination_score?: number;
  emotional_score?: number;
  cta_score?: number;
  cta_reason?: string;
}

interface OptimizeResult {
  trials: Trial[];
  best_prompt: PromptObject;
  best_score: number;
  best_hallucination: number;
  best_emotional: number;
  best_cta: number;
  cta_reason: string;
}

// Helper function to estimate request size
function estimateRequestSize(data: Record<string, unknown>): number {
  return Buffer.byteLength(JSON.stringify(data), 'utf8');
}

// Helper function to chunk large prompt arrays
function chunkPrompts(prompts: string[], maxChunkSize: number = 5): string[][] {
  const chunks = [];
  for (let i = 0; i < prompts.length; i += maxChunkSize) {
    chunks.push(prompts.slice(i, i + maxChunkSize));
  }
  return chunks;
}

// Unified function to process and save results
async function processAndSaveResults(
  result: OptimizeResult,
  experimentName: string,
  user_id: string,
  team_code: string
) {
  const dbResults = [];

  // 1. Insert all trials with full metrics
  if (result.trials && Array.isArray(result.trials)) {
    for (const trial of result.trials) {
      const { data, error } = await supabase
        .from('prompt_history')
        .insert({
          prompt_text: trial.prompt.prompt,
          response_text: trial.prompt.output ?? null,
          score: trial.score,
          experiment_name: experimentName || '',
          user_id,
          team_code,
          hallucination_score: trial.hallucination_score ?? null,
          emotional_score: trial.emotional_score ?? null,
          cta_score: trial.cta_score ?? null,
          cta_reason: trial.cta_reason ?? null,
          is_best: false, // Default to false
        })
        .select();

      if (data && data.length > 0) {
        dbResults.push(data[0]);
      }
      if (error) {
        console.error('Error inserting trial:', error);
      }
    }
  }

  // 2. Find the best prompt and update its `is_best` flag
  if (result.best_prompt && typeof result.best_prompt.prompt === 'string') {
    const bestRow = dbResults.find(
      (row) => row.prompt_text === result.best_prompt.prompt
    );

    if (bestRow) {
      console.log(`Found best row to update with ID: ${bestRow.id}`);
      await supabase
        .from('prompt_history')
        .update({
          is_best: true,
          score: result.best_score ?? bestRow.score,
          hallucination_score:
            result.best_hallucination ?? bestRow.hallucination_score,
          emotional_score: result.best_emotional ?? bestRow.emotional_score,
          cta_score: result.best_cta ?? bestRow.cta_score,
          cta_reason: result.cta_reason ?? bestRow.cta_reason,
        })
        .eq('id', bestRow.id);
    } else {
      console.warn('Could not find the best prompt in the database to update `is_best`.');
      console.log('--- DEBUGGING `is_best` ---');
      console.log('Looking for prompt text:', JSON.stringify(result.best_prompt.prompt));
      console.log('Available prompt texts in dbResults:', JSON.stringify(dbResults.map(r => r.prompt_text)));
      console.log('--- END DEBUGGING ---');
    }
  } else {
    console.warn('`result.best_prompt.prompt` is not a string or `best_prompt` is missing.');
  }

  return dbResults;
}

export async function POST(req: NextRequest) {
  try {
    // Debug headers
    const headerSize = JSON.stringify(req.headers).length;
    if (headerSize > 8000) {
      console.log('Large headers detected:', {
        size: headerSize,
        names: Array.from(req.headers.keys()),
      });
    }

    const { prompts, task, expectedOutput, experimentName, user_id, team_code } = await req.json();

    if (!prompts || !Array.isArray(prompts) || prompts.length === 0) {
      return NextResponse.json(
        { error: 'Please provide at least one prompt to analyze' },
        { status: 400 }
      );
    }

    // Request size validation
    const requestSize = estimateRequestSize({ prompts, task, expectedOutput });
    const maxSize = 8 * 1024 * 1024; // 8MB
    if (requestSize > maxSize) {
      return NextResponse.json(
        {
          error: `Request too large (${(requestSize / 1024 / 1024).toFixed(2)}MB).`,
          suggestion: 'Please reduce the number of prompts or their size.',
        },
        { status: 413 }
      );
    }

    // --- Unified Optimization Logic ---
    const scriptPath = path.join(process.cwd(), 'scripts', 'optimize.py');
    const tempFilePath = path.join(process.cwd(), `temp_input_${Date.now()}.json`);
    
    const tempData = { prompts, task: task || '', expectedOutput: expectedOutput || '' };
    fs.writeFileSync(tempFilePath, JSON.stringify(tempData, null, 2), 'utf8');

    const { stdout } = await execAsync(`python "${scriptPath}" "${tempFilePath}"`);
    fs.unlinkSync(tempFilePath); // Clean up temp file

    // Find the last valid JSON object in the output
    const lines = stdout.split('\n');
    let jsonString = '';
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i].trim();
      if (line.startsWith('{') && line.endsWith('}')) {
        try {
          JSON.parse(line);
          jsonString = line;
          break;
        } catch {
          // Not a valid JSON object, continue
        }
      }
    }

    if (!jsonString) {
      throw new Error('No valid JSON found in Python script output.');
    }

    const result: OptimizeResult = JSON.parse(jsonString);

    // Process and save results using the unified function
    const dbResults = await processAndSaveResults(result, experimentName, user_id, team_code);

    // Send Telegram notification
    if (team_code && result.best_prompt) {
      try {
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user_id)
          .single();

        await telegramBot.sendNotification({
          teamCode: team_code,
          userName: userProfile?.full_name || 'Unknown User',
          bestPrompt: { prompt: result.best_prompt.prompt },
          experimentName: experimentName || 'Unnamed Experiment',
          promptCount: prompts.length,
          bestScore: result.best_score,
        });
      } catch (telegramError) {
        console.error('Failed to send Telegram notification:', telegramError);
      }
    }

    return NextResponse.json({ ...result, dbResults });
  } catch (error: unknown) {
    console.error('❌ Python script execution failed:', error);
    const message = error instanceof Error ? error.message : 'Optimization failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
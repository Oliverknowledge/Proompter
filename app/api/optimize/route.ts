// File: app/api/optimize/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import path from 'path';
import { promisify } from 'util';
import fs from 'fs';
import { supabase } from '@/supabase/client';
import { telegramBot } from '@/lib/telegram';

const execAsync = promisify(exec);

export async function POST(req: NextRequest) {
  try {
    // Get the user's prompts from the request body
    const { prompts, task, expectedOutput, experimentName, user_id, team_code } = await req.json();
    console.log(prompts, task, expectedOutput)
    console.log("user id and team code backend ", user_id, team_code )
    if (!prompts || !Array.isArray(prompts) || prompts.length === 0) {
      return NextResponse.json(
        { error: 'Please provide at least one prompt to analyze' },
        { status: 400 }
      );
    }

    // Create a temporary file with the input data - FIX: Use UTF-8 encoding
    const tempData = { prompts, task: task || '', expectedOutput: expectedOutput || '' };
    const tempFilePath = path.join(process.cwd(), 'temp_input.json');
    fs.writeFileSync(tempFilePath, JSON.stringify(tempData), 'utf8');

    // Run the Python optimizer script with the temp file
    const scriptPath = path.join(process.cwd(), 'scripts', 'optimize.py');
    const { stdout } = await execAsync(`python "${scriptPath}" "${tempFilePath}"`);

    // Clean up the temp file
    try {
      fs.unlinkSync(tempFilePath);
    } catch (e) {
      // Ignore cleanup errors
    }

    // Find the last JSON object in the output
    const lines = stdout.split('\n');
    let jsonString = '';
    
    // Look for the last line that contains valid JSON
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i].trim();
      if (line.startsWith('{') && line.endsWith('}')) {
        try {
          JSON.parse(line);
          jsonString = line;
          break;
        } catch (e) {
          // Continue searching
        }
      }
    }

    if (!jsonString) {
      throw new Error('No valid JSON found in Python script output');
    }

    const result = JSON.parse(jsonString);

    // Save all prompts and scores to Supabase and collect inserted rows
    const dbResults = [];
    if (result.trials && Array.isArray(result.trials)) {
      for (const trial of result.trials) {
        const { data, error } = await supabase.from('prompt_history').insert({
          prompt_text: trial.prompt,
          response_text: trial.response ?? null,
          score: trial.score,
          experiment_name: experimentName || '',
          user_id,
          team_code,
          hallucination_score: trial.hallucination_score ?? null,
          emotional_score: trial.emotional_score ?? null,
          cta_score: trial.cta_score ?? null,
          cta_reason: trial.cta_reason ?? null,
          is_best: false,
        }).select();
        if (data && data.length > 0) dbResults.push(data[0]);
        if (error){
        console.log(error);
        }
      }
    }
    // Update the best prompt row if available
    if (result.best_prompt) {
      // Find the matching row in dbResults
      const bestRow = dbResults.find(row => row.prompt_text === result.best_prompt);
      if (bestRow) {
        await supabase.from('prompt_history').update({
          is_best: true,
          response_text: result.best_response ?? bestRow.response_text,
          score: result.best_score ?? bestRow.score,
          hallucination_score: result.best_hallucination ?? null,
          emotional_score: result.best_emotional ?? null,
          cta_score: result.best_cta ?? null,
          cta_reason: result.cta_reason ?? null,
        }).eq('id', bestRow.id);
      }
    }

    // Send Telegram notification to team
    if (team_code) {
      try {
        // Get user profile for notification
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user_id)
          .single();

        const userName = userProfile?.full_name || 'Unknown User';
        
        await telegramBot.sendNotification({
          teamCode: team_code,
          userName: userName,
          bestPrompt: result.best_prompt,
          experimentName: experimentName || 'Unnamed Experiment',
          promptCount: prompts.length,
          bestScore: result.best_score,
        });
      } catch (telegramError) {
        console.error('Failed to send Telegram notification:', telegramError);
        // Don't fail the entire request if Telegram notification fails
      }
    }

    return NextResponse.json({ ...result, dbResults });
  } catch (error: unknown) {
    console.error('❌ Python script execution failed:', error);
    const message = error instanceof Error ? error.message : 'Optimization failed';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
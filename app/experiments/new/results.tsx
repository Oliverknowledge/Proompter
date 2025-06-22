"use client";
import { useSearchParams } from 'next/navigation';

export default function ResultsPage() {
  const searchParams = useSearchParams();
  const resultParam = searchParams.get('result');
  let result: unknown = null;
  try {
    result = resultParam ? JSON.parse(resultParam) : null;
  } catch {
    result = null;
  }

  const trials = (result && typeof result === 'object' && 'dbResults' in result && Array.isArray((result as any).dbResults) && (result as any).dbResults.length > 0)
    ? (result as any).dbResults
    : (result && typeof result === 'object' && 'trials' in result ? (result as any).trials : []);

  if (!result) {
    return <div className="p-8 text-red-500">No results found or failed to parse results.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">Optimization Results</h1>
      <div className="mb-6 p-4 bg-emerald-900/20 rounded-xl">
        <h2 className="text-xl font-semibold mb-2">Best Prompt</h2>
        <div className="bg-gray-900 p-4 rounded-lg text-gray-100 mb-2">
          {(result as any).best_prompt}
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-gray-300">
          <div>Score: <span className="font-bold text-emerald-400">{(result as any).best_score}</span></div>
          <div>Hallucination: <span className="font-bold text-purple-400">{(result as any).best_hallucination}</span></div>
          <div>Emotional: <span className="font-bold text-cyan-400">{(result as any).best_emotional}</span></div>
          <div>CTA: <span className="font-bold text-pink-400">{(result as any).best_cta}</span></div>
        </div>
        {(result as any).cta_reason && (
          <div className="mt-2 text-xs text-gray-400">CTA Reason: {(result as any).cta_reason}</div>
        )}
      </div>
      <h2 className="text-lg font-semibold mb-2">All Trials (from Database)</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-gray-800 rounded-lg">
          <thead>
            <tr className="text-gray-300">
              <th className="p-2">Prompt</th>
              <th className="p-2">Score</th>
              <th className="p-2">Experiment</th>
              <th className="p-2">User</th>
              <th className="p-2">Team</th>
            </tr>
          </thead>
          <tbody>
            {trials.map((trial: unknown, idx: number) => {
              const t = trial as { id?: string; prompt_text?: string; prompt?: string; score?: number; experiment_name?: string; user_id?: string; team_code?: string };
              return (
                <tr key={t.id || idx} className="border-b border-gray-700">
                  <td className="p-2 text-gray-100 max-w-xs truncate">{t.prompt_text || t.prompt}</td>
                  <td className="p-2 text-emerald-300">{t.score}</td>
                  <td className="p-2">{t.experiment_name || ''}</td>
                  <td className="p-2">{t.user_id || ''}</td>
                  <td className="p-2">{t.team_code || ''}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
} 
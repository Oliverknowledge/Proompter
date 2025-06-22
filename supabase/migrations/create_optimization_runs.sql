-- Create optimization_runs table
CREATE TABLE IF NOT EXISTS optimization_runs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  dataset_name TEXT NOT NULL,
  objective_name TEXT NOT NULL,
  status TEXT DEFAULT 'running' CHECK (status IN ('running', 'completed', 'cancelled')),
  metadata JSONB,
  num_trials INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  team_code TEXT,
  experiment_name TEXT
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_optimization_runs_user_id ON optimization_runs(user_id);
CREATE INDEX IF NOT EXISTS idx_optimization_runs_team_code ON optimization_runs(team_code);
CREATE INDEX IF NOT EXISTS idx_optimization_runs_status ON optimization_runs(status);
CREATE INDEX IF NOT EXISTS idx_optimization_runs_created_at ON optimization_runs(created_at DESC);

-- RLS is disabled for now - uncomment below if you want to enable it later
-- ALTER TABLE optimization_runs ENABLE ROW LEVEL SECURITY;

-- Policy for users to see their own optimization runs
-- CREATE POLICY "Users can view their own optimization runs" ON optimization_runs
--   FOR SELECT USING (auth.uid() = user_id);

-- Policy for users to insert their own optimization runs
-- CREATE POLICY "Users can insert their own optimization runs" ON optimization_runs
--   FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own optimization runs
-- CREATE POLICY "Users can update their own optimization runs" ON optimization_runs
--   FOR UPDATE USING (auth.uid() = user_id);

-- Policy for users to delete their own optimization runs
-- CREATE POLICY "Users can delete their own optimization runs" ON optimization_runs
--   FOR DELETE USING (auth.uid() = user_id);

-- Team-based policies (if team_code is provided)
-- CREATE POLICY "Team members can view team optimization runs" ON optimization_runs
--   FOR SELECT USING (
--     team_code IS NOT NULL AND 
--     team_code IN (
--       SELECT team_code FROM profiles WHERE id = auth.uid()
--     )
--   );

-- Update function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_optimization_runs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_optimization_runs_updated_at
  BEFORE UPDATE ON optimization_runs
  FOR EACH ROW
  EXECUTE FUNCTION update_optimization_runs_updated_at(); 
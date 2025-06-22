-- Disable RLS on optimization_runs table
ALTER TABLE optimization_runs DISABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own optimization runs" ON optimization_runs;
DROP POLICY IF EXISTS "Users can insert their own optimization runs" ON optimization_runs;
DROP POLICY IF EXISTS "Users can update their own optimization runs" ON optimization_runs;
DROP POLICY IF EXISTS "Users can delete their own optimization runs" ON optimization_runs;
DROP POLICY IF EXISTS "Team members can view team optimization runs" ON optimization_runs; 
# Database Migrations

## Optimization Runs Migration

This migration adds support for Opik-style optimization runs to track progressive prompt optimization.

### Running the Migration

1. **Using Supabase CLI:**
   ```bash
   supabase db push
   ```

2. **Using Supabase Dashboard:**
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Copy and paste the contents of `create_optimization_runs.sql`
   - Execute the SQL

3. **Manual SQL Execution:**
   ```sql
   -- Copy and paste the contents of create_optimization_runs.sql
   ```

### What This Migration Adds

- **optimization_runs table**: Tracks optimization run metadata
- **Row Level Security (RLS)**: Ensures users can only access their own runs
- **Team support**: Allows team members to view shared optimization runs
- **Automatic timestamps**: Updates `updated_at` automatically
- **Indexes**: Optimized queries for performance

### Table Structure

```sql
optimization_runs (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  dataset_name TEXT NOT NULL,
  objective_name TEXT NOT NULL,
  status TEXT DEFAULT 'running',
  metadata JSONB,
  num_trials INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  user_id UUID REFERENCES auth.users(id),
  team_code TEXT,
  experiment_name TEXT
)
```

### Status Values

- `running`: Optimization is currently in progress
- `completed`: Optimization has finished successfully
- `cancelled`: Optimization was cancelled by user

### Security

- Users can only view/edit their own optimization runs
- Team members can view runs shared with their team
- All operations are protected by Row Level Security (RLS) 
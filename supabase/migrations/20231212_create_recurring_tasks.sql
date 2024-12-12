-- Create recurring_tasks table
CREATE TABLE IF NOT EXISTS recurring_tasks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    reminder_time TIME NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create function to copy recurring tasks to tasks table
CREATE OR REPLACE FUNCTION copy_recurring_tasks_to_tasks()
RETURNS void AS $$
BEGIN
    INSERT INTO tasks (title, status, created_at, updated_at, user_id)
    SELECT 
        title,
        'active' as status,
        NOW() as created_at,
        NOW() as updated_at,
        user_id
    FROM recurring_tasks
    WHERE status = 'active';
END;
$$ LANGUAGE plpgsql;

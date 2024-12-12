-- Enable RLS (if not already enabled)
alter table tasks enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Users can create their own tasks" on tasks;
drop policy if exists "Users can view their own tasks" on tasks;
drop policy if exists "Users can update their own tasks" on tasks;
drop policy if exists "Users can delete their own tasks" on tasks;

-- Create policies
create policy "Users can create their own tasks"
on tasks for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can view their own tasks"
on tasks for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can update their own tasks"
on tasks for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their own tasks"
on tasks for delete
to authenticated
using (auth.uid() = user_id); 
-- First, let's make sure the user_id column exists and has the correct type
do $$ 
begin
  if not exists (
    select from information_schema.columns 
    where table_name = 'tasks' and column_name = 'user_id'
  ) then
    alter table tasks add column user_id uuid references auth.users(id);
  end if;
end $$;

-- Make sure user_id is not nullable
alter table tasks alter column user_id set not null;

-- Drop existing policies
drop policy if exists "Users can create their own tasks" on tasks;
drop policy if exists "Users can view their own tasks" on tasks;
drop policy if exists "Users can update their own tasks" on tasks;
drop policy if exists "Users can delete their own tasks" on tasks;

-- Recreate policies with explicit type casting
create policy "Users can create their own tasks"
on tasks for insert
to authenticated
with check (auth.uid()::text = user_id::text);

create policy "Users can view their own tasks"
on tasks for select
to authenticated
using (auth.uid()::text = user_id::text);

create policy "Users can update their own tasks"
on tasks for update
to authenticated
using (auth.uid()::text = user_id::text)
with check (auth.uid()::text = user_id::text);

create policy "Users can delete their own tasks"
on tasks for delete
to authenticated
using (auth.uid()::text = user_id::text);

-- Grant necessary permissions
grant usage on schema public to authenticated;
grant all on tasks to authenticated;

-- Enable RLS
alter table tasks enable row level security; 
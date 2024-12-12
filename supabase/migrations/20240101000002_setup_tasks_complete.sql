-- Drop existing policies
drop policy if exists "Users can create their own tasks" on tasks;
drop policy if exists "Users can view their own tasks" on tasks;
drop policy if exists "Users can update their own tasks" on tasks;
drop policy if exists "Users can delete their own tasks" on tasks;

-- Drop existing functions that depend on tasks
drop function if exists get_tasks(boolean,task_category,task_priority,timestamp with time zone,timestamp with time zone,text);
drop function if exists get_tasks(uuid,text,text,text,boolean,uuid,text);

-- Drop and recreate the tasks table with CASCADE
drop table if exists tasks cascade;

-- Create ENUM types if they don't exist
do $$ begin
    create type task_priority as enum ('low', 'medium', 'high');
exception
    when duplicate_object then null;
end $$;

do $$ begin
    create type task_status as enum ('active', 'completed', 'archived');
exception
    when duplicate_object then null;
end $$;

create table tasks (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references auth.users(id) not null,
    title text not null,
    description text,
    status task_status not null default 'active',
    priority task_priority not null default 'medium',
    due_date timestamp with time zone,
    completed_at timestamp with time zone,
    deleted_at timestamp with time zone,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    parent_id uuid references tasks(id),
    is_subtask boolean default false,
    section text,
    position integer
);

-- Create indexes
create index tasks_user_id_idx on tasks(user_id);
create index tasks_parent_id_idx on tasks(parent_id);
create index tasks_status_idx on tasks(status);
create index tasks_deleted_at_idx on tasks(deleted_at);

-- Enable RLS
alter table tasks enable row level security;

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
using (auth.uid() = user_id);

create policy "Users can delete their own tasks"
on tasks for delete
to authenticated
using (auth.uid() = user_id);

-- Grant necessary permissions
grant usage on schema public to authenticated;
grant all on tasks to authenticated;

-- Create or replace the get_tasks function
create or replace function get_tasks(
    p_user_id uuid,
    p_status text default null,
    p_priority text default null,
    p_section text default null,
    p_is_subtask boolean default false,
    p_parent_id uuid default null,
    p_search text default null
)
returns setof tasks
language plpgsql
security definer
as $$
begin
    return query
    select *
    from tasks
    where user_id = p_user_id
    and deleted_at is null
    and (p_status is null or status::text = p_status)
    and (p_priority is null or priority::text = p_priority)
    and (p_section is null or section = p_section)
    and (p_is_subtask is null or is_subtask = p_is_subtask)
    and (p_parent_id is null or parent_id = p_parent_id)
    and (
        p_search is null
        or title ilike '%' || p_search || '%'
        or description ilike '%' || p_search || '%'
    )
    order by 
        case when completed_at is null then 0 else 1 end,
        case when due_date is null then 1 else 0 end,
        due_date asc nulls last,
        position asc nulls last,
        created_at desc;
end;
$$; 
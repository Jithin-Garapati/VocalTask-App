-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create custom types
create type task_priority as enum ('low', 'medium', 'high');
create type task_category as enum ('personal', 'work', 'shopping', 'health');

-- Drop existing table if it exists
drop table if exists public.tasks;

-- Create the tasks table
create table public.tasks (
    id uuid primary key default uuid_generate_v4(),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    user_id uuid references auth.users(id) on delete cascade,
    title text not null,
    completed boolean not null default false,
    priority task_priority not null default 'medium',
    category task_category,
    due_date timestamptz,
    sections jsonb not null default '[]'::jsonb,
    deleted_at timestamptz
);

-- Create indexes
create index tasks_user_id_idx on public.tasks(user_id);
create index tasks_completed_idx on public.tasks(completed) where deleted_at is null;
create index tasks_due_date_idx on public.tasks(due_date) where completed = false and deleted_at is null;

-- Enable RLS
alter table public.tasks enable row level security;

-- Drop existing policies if any
drop policy if exists "Users can view their own tasks" on public.tasks;
drop policy if exists "Users can create their own tasks" on public.tasks;
drop policy if exists "Users can update their own tasks" on public.tasks;
drop policy if exists "Users can soft delete their own tasks" on public.tasks;

-- Create policies
create policy "Users can view their own tasks"
    on public.tasks for select
    using (
        auth.uid() = user_id
        and deleted_at is null
    );

create policy "Users can create their own tasks"
    on public.tasks for insert
    with check (
        auth.uid() = coalesce(user_id, auth.uid())
    );

create policy "Users can update their own tasks"
    on public.tasks for update
    using (
        auth.uid() = user_id
        and deleted_at is null
    );

create policy "Users can soft delete their own tasks"
    on public.tasks for update
    using (
        auth.uid() = user_id
        and deleted_at is null
    );

-- Create trigger for updated_at
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
security definer
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

-- Create trigger for setting user_id
create or replace function public.handle_auth_user_id()
returns trigger
language plpgsql
security definer
as $$
begin
    if new.user_id is null then
        new.user_id = auth.uid();
    end if;
    return new;
end;
$$;

create trigger on_tasks_updated
    before update on public.tasks
    for each row
    execute function public.handle_updated_at();

create trigger on_tasks_created
    before insert on public.tasks
    for each row
    execute function public.handle_auth_user_id();

-- Create function to get tasks
create or replace function public.get_tasks(
    _completed boolean default null,
    _category task_category default null,
    _priority task_priority default null,
    _due_before timestamptz default null,
    _due_after timestamptz default null,
    _search text default null
)
returns setof public.tasks
language sql
security definer
stable
as $$
    select *
    from public.tasks
    where user_id = auth.uid()
    and deleted_at is null
    and (
        _completed is null
        or completed = _completed
    )
    and (
        _category is null
        or category = _category
    )
    and (
        _priority is null
        or priority = _priority
    )
    and (
        _due_before is null
        or due_date <= _due_before
    )
    and (
        _due_after is null
        or due_date >= _due_after
    )
    and (
        _search is null
        or title ilike '%' || _search || '%'
        or sections::text ilike '%' || _search || '%'
    )
    order by
        case when completed then 1 else 0 end,
        case
            when due_date < now() then 0
            else 1
        end,
        due_date nulls last,
        created_at desc;
$$; 
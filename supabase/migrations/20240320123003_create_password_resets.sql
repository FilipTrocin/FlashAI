-- Migration: Create Password Resets Table
-- Description: Creates the password resets table with RLS
-- Author: FlashAI Team
-- Date: 2024-03-20

-- Create password resets table
create table public.password_resets (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    token text not null,
    expires_at timestamptz not null,
    created_at timestamptz default now() not null,
    constraint token_unique unique(token)
);

-- Create index
create unique index password_resets_token_idx on public.password_resets(token);

-- Enable RLS
alter table public.password_resets enable row level security;

-- Create RLS policies
create policy "password_resets_select_own" on public.password_resets
    for select using (auth.uid() = user_id);

create policy "password_resets_delete_own" on public.password_resets
    for delete using (auth.uid() = user_id); 
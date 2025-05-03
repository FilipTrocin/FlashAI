-- Migration: Create AI Metrics Table
-- Description: Creates the AI metrics table with RLS
-- Author: FlashAI Team
-- Date: 2024-03-20

-- Create AI metrics table
create table public.ai_metrics (
    user_id uuid primary key references auth.users(id) on delete cascade,
    accepted_cnt integer default 0 not null,
    generated_cnt integer default 0 not null,
    updated_at timestamptz default now() not null
);

-- Enable RLS
alter table public.ai_metrics enable row level security;

-- Create RLS policies
create policy "ai_metrics_select_own" on public.ai_metrics
    for select using (auth.uid() = user_id);

create policy "ai_metrics_update_own" on public.ai_metrics
    for update using (auth.uid() = user_id)
    with check (auth.uid() = user_id); 
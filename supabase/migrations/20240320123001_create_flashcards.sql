-- Migration: Create Flashcards Table
-- Description: Creates the core flashcards table with constraints and RLS
-- Author: FlashAI Team
-- Date: 2024-03-20

-- Create flashcards table
create table public.flashcards (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    question text not null,
    answer text not null,
    difficulty integer default 0,
    ai_generated boolean default false not null,
    ai_status smallint,
    next_review_at timestamptz default now() not null,
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null,
    
    -- Constraints
    constraint difficulty_range check (difficulty between 0 and 5),
    constraint ai_status_range check (ai_status between 0 and 2),
    constraint question_length check (array_length(regexp_split_to_array(question, '\s+'), 1) between 4 and 50),
    constraint answer_length check (array_length(regexp_split_to_array(answer, '\s+'), 1) between 4 and 200)
);

-- Create indexes
create index flashcards_user_idx on public.flashcards(user_id);
create index flashcards_next_review_idx on public.flashcards(next_review_at);
create index flashcards_ai_generated_idx on public.flashcards(ai_generated);

-- Enable RLS
alter table public.flashcards enable row level security;

-- Create RLS policies
create policy "flashcards_select_own" on public.flashcards
    for select using (auth.uid() = user_id);

create policy "flashcards_insert_own" on public.flashcards
    for insert with check (auth.uid() = user_id);

create policy "flashcards_update_own" on public.flashcards
    for update using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "flashcards_delete_own" on public.flashcards
    for delete using (auth.uid() = user_id); 
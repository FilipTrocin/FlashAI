-- Migration: Create Triggers and Functions
-- Description: Creates trigger functions for updated_at and ai_metrics
-- Author: FlashAI Team
-- Date: 2024-03-20

-- Create trigger function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Create triggers for updated_at
create trigger set_timestamp
    before update on public.flashcards
    for each row
    execute function public.handle_updated_at();

create trigger set_timestamp
    before update on public.ai_metrics
    for each row
    execute function public.handle_updated_at();

-- Create trigger function to update ai_metrics
create or replace function public.update_ai_metrics()
returns trigger as $$
begin
    if (tg_op = 'INSERT' and new.ai_generated = true) then
        insert into public.ai_metrics (user_id, generated_cnt)
        values (new.user_id, 1)
        on conflict (user_id) do update
        set generated_cnt = ai_metrics.generated_cnt + 1;
    end if;

    if (tg_op = 'UPDATE' and new.ai_status = 0 and old.ai_status is null) then
        update public.ai_metrics
        set accepted_cnt = accepted_cnt + 1
        where user_id = new.user_id;
    end if;

    return new;
end;
$$ language plpgsql;

-- Create trigger for ai_metrics updates
create trigger update_ai_metrics
    after insert or update on public.flashcards
    for each row
    execute function public.update_ai_metrics(); 
-- Migration: Create Policy Toggle Function
-- Description: Creates a function to toggle RLS policies for development purposes
-- Author: FlashAI Team
-- Date: 2024-03-21
-- WARNING: THIS IS FOR DEVELOPMENT USE ONLY. DO NOT USE IN PRODUCTION!

-- Create private schema if it doesn't exist
create schema if not exists private;

-- Create function to toggle all policies
create or replace function private.toggle_policies(should_enable boolean)
returns void as $$
declare
    policy_record record;
begin
    -- Verify we're not in production
    if current_setting('app.settings.environment', true) = 'production' then
        raise exception 'This function cannot be run in production environment';
    end if;

    -- Loop through all policies in our public schema
    for policy_record in
        select schemaname, tablename, policyname
        from pg_policies
        where schemaname = 'public'
    loop
        if should_enable then
            execute format(
                'alter policy %I on %I.%I enable',
                policy_record.policyname,
                policy_record.schemaname,
                policy_record.tablename
            );
        else
            execute format(
                'alter policy %I on %I.%I disable',
                policy_record.policyname,
                policy_record.schemaname,
                policy_record.tablename
            );
        end if;
    end loop;
end;
$$ language plpgsql security definer;

-- Create helper functions for easier usage
create or replace function private.disable_all_policies()
returns void as $$
begin
    perform private.toggle_policies(false);
end;
$$ language plpgsql security definer;

create or replace function private.enable_all_policies()
returns void as $$
begin
    perform private.toggle_policies(true);
end;
$$ language plpgsql security definer;

-- Grant execute permissions to authenticated users
-- Note: In production, these grants should be removed
grant execute on function private.toggle_policies(boolean) to authenticated;
grant execute on function private.disable_all_policies() to authenticated;
grant execute on function private.enable_all_policies() to authenticated;

-- Create comment
comment on function private.toggle_policies(boolean) is 'Development only: Toggles all RLS policies';
comment on function private.disable_all_policies() is 'Development only: Disables all RLS policies';
comment on function private.enable_all_policies() is 'Development only: Enables all RLS policies';

-- Create revert function for rollback
create or replace function private.revert_20240321000000()
returns void as $$
begin
    -- Enable all policies before dropping functions
    perform private.enable_all_policies();
    
    -- Drop functions
    drop function if exists private.enable_all_policies();
    drop function if exists private.disable_all_policies();
    drop function if exists private.toggle_policies(boolean);
    drop function if exists private.revert_20240321000000();
end;
$$ language plpgsql; 
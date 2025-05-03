-- Migration: Enable Extensions and User Constraints
-- Description: Sets up required extensions and adds email format check to users table
-- Author: FlashAI Team
-- Date: 2024-03-20

-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- Add email format check to Supabase Auth users table
alter table auth.users
    add constraint email_format check (email ~* '^[^@]+@[^@]+\.[^@]+$'); 
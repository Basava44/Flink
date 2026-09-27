# Database Migrations

## Fresh Environment Setup
Run `supabase/schema.sql` in the Supabase SQL Editor. This creates all tables, indexes, RLS policies, triggers, and functions from scratch.

## Incremental Migrations
After the initial schema, apply numbered migration files in order:

```
001_*.sql
002_*.sql
...
```

Each migration is idempotent (safe to re-run). Apply them via Supabase SQL Editor.

## Rules
- schema.sql is the single source of truth for a fresh database
- Never modify schema.sql to fix production - create a new migration instead
- After testing a migration in production, merge its changes back into schema.sql
- Name format: `NNN_short_description.sql`

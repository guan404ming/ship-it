# Supabase Cheat Sheet

## Init

1. Login: `bun run supabase login`
2. Link DB: `bun run supabase link --project-ref <project-id>`

## Migrations

1. Create migration: `bun run supabase migration new <name>`
2. List migrations: `bun run supabase migration list`
3. Push migration: `bun run supabase migration up`

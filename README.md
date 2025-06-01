# 🛒 Ship It

The application is built with [Bun](https://bun.sh/), [React](https://reactjs.org/), [TypeScript](https://www.typescriptlang.org/), [Next.js](https://nextjs.org/) and [Shadcn UI](https://ui.shadcn.com/).

## 🔧 Setup

```bash
cp .env.example .env
```

Edit the `.env` file with your own values.

## 💻 Development

```bash
# Install dependencies
bun install

# Run the application
bun run dev

# Lint
bun run lint
```

When the application is running, you can access the application at [http://localhost:3000](http://localhost:3000).

## ⚡️ Supabase

## Init

```bash
# Login 
bun run supabase login

# Link DB
bun run supabase link --project-ref <project-id>
```

## Migrations

```bash
# Create migration
bun run supabase migration new <name>

# List migrations
bun run supabase migration list

# Push migration
bun run supabase db push

# Generate types
bun run supabase gen types typescript --project-id <project-id> --schema public > database.types.ts
```

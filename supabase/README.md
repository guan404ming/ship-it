# Supabase Cheat Sheet

## 1. Prerequisites

- Install Bun / Node.js  
- Install Supabase CLI  

  ```bash
  npm install -g supabase
  ```

- Install required packages  

  ```bash
  bun add @supabase/supabase-js @supabase/postgres-js
  ```

## 2. Environment Setup

Create `.env` or `.env.local` in your project root:

```env
# Database connection string (with credentials)
SUPABASE_DB_URL=postgres://postgres:<password>@db.<your-project>.supabase.co:5432/postgres

# Public anon key (for client-side)
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

> Bun automatically loads `.env` files. For Node.js, install `dotenv` package.

## 3. Initialize Supabase

```bash
# First-time setup
supabase login
supabase init
supabase link
```

## 4. Creating & Managing Migrations

1. **Create a migration**  

   ```bash
   supabase migration new create_categories_and_products
   ```

## 5. Deploying to Production

1. **Link remote project**  

   ```bash
   supabase login
   supabase link
   ```

2. **Push and apply migrations**  

   ```bash
   supabase db push
   ```

## 6. Using Supabase in Code

- **Dynamic schema creation (optional)**  

  ```ts
  // supabase.ts
  import { createClient } from '@supabase/postgres-js'
  import 'dotenv/config'

  const pg = createClient(process.env.SUPABASE_DB_URL!, {
    headers: {
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
    },
  })

  export async function initSchema() {
    await pg.execute(`
      CREATE TABLE IF NOT EXISTS categories (...);
      CREATE TABLE IF NOT EXISTS products (...);
    `)
  }
  ```

- **Standard CRUD (using supabase-js)**  

  ```ts
  // lib/supabase-client.ts
  import { createClient } from '@supabase/supabase-js'

  export const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  ```

## 7. Command Reference

| Function                  | Command                             |
|---------------------------|-------------------------------------|
| Create new migration      | `supabase migration new <name>`     |
| Apply pending migrations  | `supabase migration up`             |
| Reset & replay migrations | `supabase db reset`                 |
| Push to production        | `supabase db push`                  |
| List migrations           | `supabase migration list`           |
| Push to production        | `supabase db push`                  |

---

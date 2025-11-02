# Database Setup Guide

## Option 1: Local PostgreSQL Installation

### Step 1: Install PostgreSQL

**Windows:**
1. Download PostgreSQL from: https://www.postgresql.org/download/windows/
2. Run the installer and follow the setup wizard
3. Remember the password you set for the `postgres` superuser
4. Default port is `5432`

**Mac (using Homebrew):**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### Step 2: Create Database

Open PostgreSQL command line (psql) or pgAdmin:

```sql
-- Connect as postgres user
psql -U postgres

-- Create database
CREATE DATABASE teammind;

-- Create a user (optional, or use postgres)
CREATE USER teammind_user WITH PASSWORD 'your_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE teammind TO teammind_user;
```

### Step 3: Update .env File

Update your `.env` file with the correct connection string:

```env
# Format: postgresql://username:password@host:port/database_name?schema=public

# Using postgres user (default):
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/teammind?schema=public"

# OR using custom user:
DATABASE_URL="postgresql://teammind_user:your_password@localhost:5432/teammind?schema=public"
```

### Step 4: Run Database Setup

```bash
# Push schema to database
npm run db:push

# Seed teams (A-Team, B-Team, C-Team)
npm run db:seed
```

---

## Option 2: Cloud PostgreSQL (Recommended for Quick Setup)

### Supabase (Free Tier Available)

1. **Sign up** at https://supabase.com
2. **Create a new project**
3. **Go to Settings → Database**
4. **Copy the connection string** (URI format)
5. **Update `.env`**:
   ```env
   DATABASE_URL="postgresql://postgres:your_password@db.xxxxx.supabase.co:5432/postgres?schema=public"
   ```
6. **Run setup**:
   ```bash
   npm run db:push
   npm run db:seed
   ```

### Neon (Serverless PostgreSQL)

1. **Sign up** at https://neon.tech
2. **Create a new project**
3. **Copy the connection string**
4. **Update `.env`** with the connection string
5. **Run setup**:
   ```bash
   npm run db:push
   npm run db:seed
   ```

### Railway

1. **Sign up** at https://railway.app
2. **Create a new PostgreSQL database**
3. **Copy the connection string**
4. **Update `.env`**
5. **Run setup**:
   ```bash
   npm run db:push
   npm run db:seed
   ```

---

## Step 4: Verify Database Connection

Test your connection:

```bash
# Generate Prisma client (already done, but good to verify)
npm run db:generate

# Check if you can connect
npx prisma db pull
```

---

## Troubleshooting

### Error: "Connection refused"
- Make sure PostgreSQL is running: `sudo systemctl status postgresql` (Linux) or check Services on Windows
- Verify the port (default: 5432)
- Check firewall settings

### Error: "Password authentication failed"
- Double-check the password in your `.env` file
- Try resetting PostgreSQL password if needed

### Error: "Database does not exist"
- Make sure you created the database: `CREATE DATABASE teammind;`

### Error: "Permission denied"
- Grant proper privileges to your user
- Or use the `postgres` superuser temporarily for development

---

## Quick Test

After setup, you can verify everything works by:

1. Starting the dev server: `npm run dev`
2. Opening http://localhost:3000
3. Signing up a new user
4. The app should work without database errors!


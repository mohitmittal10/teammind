# Step-by-Step PostgreSQL Setup Guide

## Step 1: Open pgAdmin (GUI Method - Easiest)

1. Open **pgAdmin 4** from your Start Menu (search for "pgAdmin")
2. If you see a master password prompt, enter it (or skip if not set)

## Step 2: Connect to PostgreSQL Server

1. In the left sidebar, expand **Servers**
2. Expand **PostgreSQL [version]** (e.g., PostgreSQL 15)
3. If prompted for password, enter the PostgreSQL password you set during installation
   - If you forgot it, you may need to reset it (see troubleshooting below)

## Step 3: Create the Database

1. Right-click on **Databases** in the left sidebar
2. Select **Create** → **Database...**
3. In the dialog:
   - **Database name**: `teammind`
   - **Owner**: Leave as default (postgres)
   - Click **Save**

## Step 4: Get Connection Details

In pgAdmin, right-click on your `teammind` database → **Properties**:
- Check the **Port** (usually 5432)
- **Host** is typically `localhost`

You'll need:
- **Username**: Usually `postgres` (or check in Server Properties)
- **Password**: The password you set during PostgreSQL installation
- **Port**: Usually `5432`
- **Database**: `teammind`

## Step 5: Update .env File

Update your `.env` file with the format:
```
DATABASE_URL="postgresql://USERNAME:PASSWORD@localhost:PORT/teammind?schema=public"
```

Example (if username is `postgres` and password is `mypassword`):
```
DATABASE_URL="postgresql://postgres:mypassword@localhost:5432/teammind?schema=public"
```

## Step 6: Run Database Setup Commands

In your terminal (in the teammind project directory):

```powershell
# Create all tables
npm run db:push

# Seed the teams
npm run db:seed
```

---

## Alternative: Command Line Method

If you prefer command line:

### Step 1: Find PostgreSQL bin directory

Common locations:
- `C:\Program Files\PostgreSQL\15\bin` (replace 15 with your version)
- `C:\Program Files\PostgreSQL\16\bin`
- `C:\Program Files\PostgreSQL\14\bin`

### Step 2: Add to PATH (temporary for this session)

```powershell
$env:Path += ";C:\Program Files\PostgreSQL\15\bin"
# Replace 15 with your version number
```

### Step 3: Create Database

```powershell
# Connect to PostgreSQL
psql -U postgres

# Enter your password when prompted
# Then run:
CREATE DATABASE teammind;

# Exit psql
\q
```

---

## Troubleshooting

### "Password authentication failed"
- Make sure you're using the correct password
- Check if you can connect via pgAdmin first

### "Service not running"
Start PostgreSQL service:
```powershell
# Find service name
Get-Service -Name "*postgres*"

# Start it (replace SERVICE_NAME with actual name)
Start-Service -Name "postgresql-x64-15"
```

### "Database already exists"
That's okay! You can either:
- Use the existing database, or
- Drop it first: `DROP DATABASE teammind;` (in pgAdmin or psql)

### Forgot PostgreSQL password?
You may need to:
1. Edit `pg_hba.conf` file (usually in `C:\Program Files\PostgreSQL\[version]\data\`)
2. Change authentication method temporarily
3. Or use pgAdmin to change password if you can access it

---

## Next Steps After Database Setup

Once `npm run db:push` and `npm run db:seed` succeed:

1. Your database is ready!
2. Start your dev server: `npm run dev`
3. Open http://localhost:3000
4. Sign up a new user
5. Select a team (A-Team, B-Team, or C-Team)
6. Start creating knowledge cards!


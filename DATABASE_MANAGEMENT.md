# Database Management

## Clear All Data

To start fresh with an empty database:

```bash
npm run db:clear
```

This will delete:
- All content blocks
- All resume documents
- All content usages

**Note:** This cannot be undone!

## Database Commands

```bash
# Generate Prisma client (after schema changes)
npm run db:generate

# Push schema changes to database
npm run db:push

# Open Prisma Studio (visual database editor)
npm run db:studio

# Clear all data
npm run db:clear
```

## Starting Fresh

After clearing the database:

1. Start the dev server:
   ```bash
   npm run dev
   ```

2. Open http://localhost:3000/builder

3. You'll see:
   - Empty resume structure (no sections)
   - Empty block library (no blocks)

4. Create your first content:
   - Click "Add Section" to add sections
   - Click "New" in Block Library to create blocks
   - Add blocks to sections
   - Click "Compile" to generate PDF

## Block Library Features

Each block card now has a menu (three dots) that appears on hover:
- **Delete Block** - Removes the block permanently
  - Automatically removes it from any sections
  - Shows a confirmation dialog

## No More Seed Data

The database starts completely empty. This gives you full control to:
- Create only the blocks you need
- Organize sections however you want
- Start with a clean slate every time

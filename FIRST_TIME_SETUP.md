# First Time Setup Guide

## Quick Start

After installing MiKTeX and adding it to PATH, follow these steps:

### 1. Start the dev server
```bash
npm run dev
```

### 2. Click the "Setup" button

In the builder interface, you'll see two buttons:
- **Compile** - Compiles your resume to PDF
- **Setup** - Installs all required LaTeX packages (NEW!)

**Click the "Setup" button FIRST before your first compile.**

### 3. What the Setup button does

The Setup button will:
1. Check if pdflatex is installed
2. Compile a test document that uses all common resume packages
3. Trigger MiKTeX to install any missing packages
4. Show installation progress (1-2 minutes)
5. Notify you when ready

### 4. During setup

You may see MiKTeX package installation dialogs pop up. This is normal!

**Option A: Click "Install" for each package** (recommended first time)

**Option B: Enable auto-install** (to avoid dialogs):
1. Open **MiKTeX Console**
2. Go to **Settings** tab
3. Under "Package installation", select **"Always install missing packages on-the-fly"**
4. Click Apply

### 5. After setup completes

You'll see a success message: "✓ Setup Complete"

Now you can:
1. Add sections to your resume
2. Add blocks to sections
3. Click **"Compile"** to generate your PDF
4. Download the PDF

### 6. Compilation times

- **First compile after setup**: ~10 seconds (all packages already installed)
- **Subsequent compiles**: ~5 seconds (even faster)

## Troubleshooting

### Setup fails with "pdflatex not found"
- MiKTeX is not in PATH
- Follow instructions in `ADD_MIKTEX_TO_PATH.md`
- Restart VS Code/terminal after adding to PATH

### Setup takes too long (>5 minutes)
- Check your internet connection
- MiKTeX downloads packages from the internet
- Some packages are large (fonts can be 50-100 MB)

### Compile fails after successful setup
- The LaTeX template may have syntax errors
- Check the error message in the builder
- Common issues:
  - Unescaped special characters (`&`, `%`, `$`, `_`)
  - Missing closing braces
  - Undefined commands

### "Package installation failed"
1. Open MiKTeX Console
2. Go to Updates tab
3. Click "Check for updates"
4. Update MiKTeX
5. Try setup again

## What packages are installed?

The setup installs these common resume packages:
- `hyperref` - Clickable links
- `geometry` - Page margins
- `fancyhdr` - Headers/footers
- `fontawesome5` - Icons
- `xcolor` - Colors
- `enumitem` - Lists
- `titlesec` - Section formatting
- And more...

Total size: ~200-500 MB depending on what's already installed.

## After first setup

You **don't need to run Setup again** unless:
- You reinstall MiKTeX
- You're using a new resume template with different packages
- Setup failed the first time

The Compile button will work fine for all future compiles!

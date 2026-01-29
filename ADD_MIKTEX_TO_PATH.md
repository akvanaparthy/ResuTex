# Add MiKTeX to Windows PATH

MiKTeX is installed but not accessible from the command line. Follow these steps:

## Step 1: Find MiKTeX Installation Path

MiKTeX is usually installed at one of these locations:
- `C:\Program Files\MiKTeX\miktex\bin\x64`
- `C:\Users\<YourUsername>\AppData\Local\Programs\MiKTeX\miktex\bin\x64`

To find it:
1. Open File Explorer
2. Navigate to `C:\Program Files\MiKTeX\miktex\bin\x64`
3. Check if `pdflatex.exe` exists there
4. If not, check `C:\Users\aksha\AppData\Local\Programs\MiKTeX\miktex\bin\x64`
5. Copy the full path where you find `pdflatex.exe`

## Step 2: Add to System PATH

### Method 1: Using Windows Settings (Recommended)

1. Press `Win + R` to open Run dialog
2. Type: `sysdm.cpl` and press Enter
3. Click the **"Advanced"** tab
4. Click **"Environment Variables"** button at the bottom
5. Under **"System variables"** (lower section), find and select **"Path"**
6. Click **"Edit"**
7. Click **"New"**
8. Paste the MiKTeX path you found (e.g., `C:\Program Files\MiKTeX\miktex\bin\x64`)
9. Click **"OK"** on all dialogs

### Method 2: Using PowerShell (Admin)

```powershell
# Run PowerShell as Administrator, then:
$env:Path += ";C:\Program Files\MiKTeX\miktex\bin\x64"
[Environment]::SetEnvironmentVariable("Path", $env:Path, [EnvironmentVariableTarget]::Machine)
```

## Step 3: Restart Everything

1. **Close all terminal windows** (Command Prompt, PowerShell, Git Bash)
2. **Close VS Code / Cursor completely**
3. **Reopen VS Code / Cursor**
4. Open a new terminal

## Step 4: Verify Installation

In the new terminal, run:

```bash
pdflatex --version
```

You should see:
```
MiKTeX-pdfTeX 4.x.x (MiKTeX x.x)
...
```

## Step 5: Test in ResuTex

```bash
cd C:\Disk\Projs\ResuTex
node test-pdflatex.js
```

Should output: `✓ pdflatex is available!`

## Step 6: Restart Dev Server

```bash
npm run dev
```

Now try compiling a resume in the builder!

## Troubleshooting

### Still says "not recognized"?
- Make sure you **restarted your terminal** after adding to PATH
- Check the path is exactly correct (no typos)
- Verify `pdflatex.exe` exists in that folder

### Can't find MiKTeX folder?
Open Command Prompt and run:
```cmd
where pdflatex
```
If it still doesn't work, reinstall MiKTeX and choose "Add to PATH for all users" during installation.

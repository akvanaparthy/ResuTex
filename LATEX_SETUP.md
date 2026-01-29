# LaTeX Setup for ResuTex (Windows)

ResuTex requires `pdflatex` to compile LaTeX resumes to PDF. Here's how to install it on Windows.

## Option 1: MiKTeX (Recommended for Windows)

MiKTeX is a LaTeX distribution for Windows that includes pdflatex.

### Installation Steps:

1. **Download MiKTeX:**
   - Go to https://miktex.org/download
   - Download the **MiKTeX installer** (Basic or Full installer)
   - Basic installer: ~200 MB (installs packages on-demand)
   - Full installer: ~4 GB (includes all packages)

2. **Run the installer:**
   - Double-click the downloaded `.exe` file
   - Choose "Install MiKTeX for all users" (recommended) or "Install just for me"
   - Select installation directory (default is fine)
   - Choose "Yes" for automatic package installation (recommended)

3. **Verify installation:**
   - Open Command Prompt (Win+R, type `cmd`, press Enter)
   - Run:
     ```cmd
     pdflatex --version
     ```
   - You should see version information like:
     ```
     MiKTeX-pdfTeX 4.x.x (MiKTeX x.x)
     ```

4. **If not recognized:**
   - The installer should add MiKTeX to PATH automatically
   - If `pdflatex` is not recognized, add it manually:
     1. Search for "Environment Variables" in Windows Start
     2. Click "Edit the system environment variables"
     3. Click "Environment Variables" button
     4. Under "System variables", find and select "Path"
     5. Click "Edit"
     6. Click "New"
     7. Add: `C:\Program Files\MiKTeX\miktex\bin\x64` (or your installation path)
     8. Click "OK" on all dialogs
     9. **Close and reopen** Command Prompt or VS Code terminal

## Option 2: TeX Live

TeX Live is another popular LaTeX distribution.

### Installation Steps:

1. **Download TeX Live:**
   - Go to https://www.tug.org/texlive/acquire-netinstall.html
   - Download `install-tl-windows.exe`

2. **Run installer:**
   - This is a large installation (~7 GB)
   - Follow the wizard

3. **Verify installation:**
   ```cmd
   pdflatex --version
   ```

## Testing with ResuTex

After installation:

1. Restart your terminal/VS Code
2. Run ResuTex dev server:
   ```bash
   npm run dev
   ```
3. Add sections and blocks to your resume
4. Click the **Compile** button
5. The PDF should generate successfully

## Troubleshooting

### "pdflatex is not recognized"
- Make sure you restarted your terminal after installation
- Verify PATH includes the MiKTeX bin directory
- Try running `where pdflatex` to see if it's in PATH

### Missing LaTeX packages
- MiKTeX will automatically download missing packages on first use
- Make sure you allowed automatic package installation
- Or manually install packages via MiKTeX Console

### Compilation errors
- Check the error message in the builder
- Common issues:
  - Missing custom LaTeX commands (ensure your template defines them)
  - Incorrect LaTeX syntax in blocks
  - Special characters that need escaping (`&`, `%`, `$`, etc.)

## Alternative: Online LaTeX Compilation

If you don't want to install LaTeX locally, you could modify the ResuTex backend to use an online LaTeX API like:
- Overleaf API
- LaTeX.Online (https://latexonline.cc/)
- QuickLaTeX

This would require modifying `src/app/api/compile/route.ts` to use an HTTP API instead of the local `pdflatex` command.

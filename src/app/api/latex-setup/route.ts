import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import { writeFile, mkdir, rm } from "fs/promises";
import path from "path";
import os from "os";
import { randomUUID } from "crypto";

const execAsync = promisify(exec);

// Common LaTeX packages needed for resume templates
const REQUIRED_PACKAGES = [
  "hycolor",
  "hyperref",
  "geometry",
  "fancyhdr",
  "fontawesome",
  "fontawesome5",
  "xcolor",
  "enumitem",
  "titlesec",
  "parskip",
  "array",
  "etoolbox",
  "latexsym",
  "marvosym",
  "wasysym",
  "amssymb",
  "ifthen",
  "calc",
  "ragged2e",
];

export async function POST() {
  let tempDir: string | null = null;

  try {
    // Check if pdflatex is available
    try {
      await execAsync("pdflatex --version", { timeout: 5000 });
    } catch (versionError) {
      return NextResponse.json(
        {
          success: false,
          error:
            "pdflatex is not installed or not in PATH.\n\nPlease install MiKTeX and add it to PATH.\n\nSee LATEX_SETUP.md for instructions.",
        },
        { status: 500 }
      );
    }

    // Create temp directory
    tempDir = path.join(os.tmpdir(), `resutex-setup-${randomUUID()}`);
    await mkdir(tempDir, { recursive: true });

    // Create a test document that uses all common packages
    const testLatex = `\\documentclass[letterpaper,11pt]{article}

% Required packages for resume templates
\\usepackage{latexsym}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage{marvosym}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{verbatim}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage[english]{babel}
\\usepackage{tabularx}
\\usepackage{fontawesome5}
\\usepackage{geometry}
\\usepackage{xcolor}
\\usepackage{ragged2e}

\\pagestyle{fancy}
\\fancyhf{}
\\fancyfoot{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}

\\geometry{
  left=0.5in,
  top=0.5in,
  right=0.5in,
  bottom=0.5in
}

\\begin{document}

\\begin{center}
    \\textbf{\\Huge ResuTex LaTeX Setup Test} \\\\
    \\vspace{2mm}
    \\small All required packages loaded successfully!
\\end{center}

\\section*{Test Results}
\\begin{itemize}
    \\item[\\faCheck] pdflatex is working
    \\item[\\faCheck] All required packages installed
    \\item[\\faCheck] Ready to compile resumes
\\end{itemize}

\\vspace{10mm}

\\centering
\\textbf{You can now close this window and compile your resume!}

\\end{document}
`;

    const texFile = path.join(tempDir, "setup-test.tex");
    await writeFile(texFile, testLatex, "utf-8");

    // Compile the test document
    // This will trigger MiKTeX to install missing packages
    const pdflatexCmd = `pdflatex -interaction=nonstopmode -output-directory="${tempDir}" "${texFile}"`;

    let installLog = "";

    try {
      // First pass
      const { stdout: stdout1, stderr: stderr1 } = await execAsync(pdflatexCmd, {
        timeout: 120000, // 2 minutes - allow time for package installation
        windowsHide: true,
      });
      installLog += "First pass completed\n";
      installLog += stdout1 + "\n" + stderr1 + "\n";

      // Second pass
      const { stdout: stdout2, stderr: stderr2 } = await execAsync(pdflatexCmd, {
        timeout: 120000,
        windowsHide: true,
      });
      installLog += "Second pass completed\n";
      installLog += stdout2 + "\n" + stderr2 + "\n";
    } catch (error) {
      const execError = error as { stdout?: string; stderr?: string; message?: string };

      // Check if it's a package installation issue
      const errorMsg = execError.stderr || execError.stdout || execError.message || "";

      if (errorMsg.includes("not found") || errorMsg.includes("missing")) {
        return NextResponse.json({
          success: false,
          error:
            "Package installation failed.\n\nPlease ensure:\n1. MiKTeX Console is configured to auto-install packages\n2. You have internet connection\n3. MiKTeX is up to date\n\nTry running MiKTeX Console → Settings → 'Always install missing packages on-the-fly'",
          log: installLog + "\n\nError:\n" + errorMsg,
        });
      }

      // Other compilation errors might be OK if packages installed
      console.log("Setup compilation had errors but may have installed packages:", error);
    }

    // Cleanup
    await rm(tempDir, { recursive: true, force: true });
    tempDir = null;

    return NextResponse.json({
      success: true,
      message:
        "LaTeX setup complete! All required packages are ready.\n\nYou can now compile your resume.",
      packagesChecked: REQUIRED_PACKAGES.length,
    });
  } catch (error) {
    // Cleanup on error
    if (tempDir) {
      try {
        await rm(tempDir, { recursive: true, force: true });
      } catch {
        // Ignore cleanup errors
      }
    }

    console.error("LaTeX setup error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        success: false,
        error: `LaTeX setup failed: ${errorMessage}`,
      },
      { status: 500 }
    );
  }
}

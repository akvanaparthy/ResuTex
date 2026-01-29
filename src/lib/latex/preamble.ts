export const DEFAULT_PREAMBLE = `\\documentclass[letterpaper,10.5pt]{article}

\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage[english]{babel}
\\usepackage{tabularx}
\\usepackage{geometry}
\\usepackage{xcolor}
\\usepackage[T1]{fontenc}
\\input{glyphtounicode}

%----------PAGE SETUP----------
\\geometry{
    letterpaper,
    left=0.5in,
    right=0.5in,
    top=0.5in,
    bottom=0.5in
}

\\pagestyle{fancy}
\\fancyhf{}
\\fancyfoot{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}

\\urlstyle{same}
\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

% Section formatting - 12pt bold with underline
\\titleformat{\\section}{
  \\vspace{-8pt}\\raggedright\\bfseries\\fontsize{12pt}{14pt}\\selectfont
}{}{0em}{}[\\color{black}\\titlerule \\vspace{-5pt}]

% Ensure PDF is machine readable/ATS parsable
\\pdfgentounicode=1

%-------------------------
% Custom commands
\\newcommand{\\resumeItem}[1]{
  \\item\\small{#1}
}

\\newcommand{\\resumeSubheading}[4]{
  \\vspace{-3pt}\\item
    \\begin{tabular*}{\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{#1} & \\textbf{\\small #2} \\\\
      {\\small#3} & {\\small #4} \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeEducationHeading}[4]{
  \\vspace{-2pt}\\item
    \\begin{tabular*}{\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{#1}, \\textit{#3} & #2 \\\\
      #4 & \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeExperienceHeading}[3]{
  \\vspace{-2pt}\\item
    \\begin{tabular*}{\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{#1} & #2 \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeProjectHeading}[2]{
    \\item
    \\begin{tabular*}{\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\small#1 & {\\small #2}\\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeSubItem}[1]{\\resumeItem{#1}\\vspace{-4pt}}

\\renewcommand\\labelitemi{$\\vcenter{\\hbox{\\tiny$\\bullet$}}$}
\\renewcommand\\labelitemii{$\\vcenter{\\hbox{\\tiny$\\bullet$}}$}

\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=0.08in, label={}, itemsep=-2pt]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}[leftmargin=0.15in, itemsep=-2pt]}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{-5pt}}

% Define link color to match original
\\definecolor{linkblue}{HTML}{1154CC}
`;

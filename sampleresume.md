%-------------------------
% Resume in LaTeX - Matching Original DOCX Format
% ATS-Friendly - pdfLaTeX Compatible Version
%-------------------------

\documentclass[legalpaper,10.5pt]{article}

\usepackage[empty]{fullpage}
\usepackage{titlesec}
\usepackage[usenames,dvipsnames]{color}
\usepackage{enumitem}
\usepackage[hidelinks]{hyperref}
\usepackage{fancyhdr}
\usepackage[english]{babel}
\usepackage{tabularx}
\usepackage{geometry}
\usepackage{xcolor}
\usepackage[T1]{fontenc}
% \usepackage{helvet}
% \renewcommand{\familydefault}{\sfdefault}
\input{glyphtounicode}

%----------PAGE SETUP----------
\geometry{
    legalpaper,
    left=0.5in,
    right=0.5in,
    top=0.5in,
    bottom=0.5in
}

\pagestyle{fancy}
\fancyhf{}
\fancyfoot{}
\renewcommand{\headrulewidth}{0pt}
\renewcommand{\footrulewidth}{0pt}

\urlstyle{same}
\raggedbottom
\raggedright
\setlength{\tabcolsep}{0in}

% Section formatting - 12pt bold with underline
\titleformat{\section}{
  \vspace{-8pt}\raggedright\bfseries\fontsize{12pt}{14pt}\selectfont
}{}{0em}{}[\color{black}\titlerule \vspace{-5pt}]

% Ensure PDF is machine readable/ATS parsable
\pdfgentounicode=1

%-------------------------
% Custom commands
\newcommand{\resumeItem}[1]{
  \item\small{#1}
}

\newcommand{\resumeSubheading}[4]{
  \vspace{-3pt}\item
    \begin{tabular*}{\textwidth}[t]{l@{\extracolsep{\fill}}r}
      \textbf{#1} & \textbf{\small #2} \\
      {\small#3} & {\small #4} \\
    \end{tabular*}\vspace{-7pt}
}

\newcommand{\resumeEducationHeading}[4]{
  \vspace{-2pt}\item
    \begin{tabular*}{\textwidth}[t]{l@{\extracolsep{\fill}}r}
      \textbf{#1}, \textit{#3} & #2 \\
      #4 & \\
    \end{tabular*}\vspace{-7pt}
}

\newcommand{\resumeExperienceHeading}[3]{
  \vspace{-2pt}\item
    \begin{tabular*}{\textwidth}[t]{l@{\extracolsep{\fill}}r}
      \textbf{#1} & #2 \\
    \end{tabular*}\vspace{-7pt}
}

\newcommand{\resumeProjectHeading}[2]{
    \item
    \begin{tabular*}{\textwidth}{l@{\extracolsep{\fill}}r}
      \small#1 & {\small #2}\\
    \end{tabular*}\vspace{-7pt}
}

\newcommand{\resumeSubItem}[1]{\resumeItem{#1}\vspace{-4pt}}

\renewcommand\labelitemi{$\vcenter{\hbox{\tiny$\bullet$}}$}
\renewcommand\labelitemii{$\vcenter{\hbox{\tiny$\bullet$}}$}

\newcommand{\resumeSubHeadingListStart}{\begin{itemize}[leftmargin=0.08in, label={}, itemsep=-2pt]}
\newcommand{\resumeSubHeadingListEnd}{\end{itemize}}
\newcommand{\resumeItemListStart}{\begin{itemize}[leftmargin=0.15in, itemsep=-2pt]}
\newcommand{\resumeItemListEnd}{\end{itemize}\vspace{-5pt}}

% Define link color to match original
\definecolor{linkblue}{HTML}{1154CC}

%-------------------------------------------
%%%%%%  RESUME STARTS HERE  %%%%%%%%%%%%%%%%%%%%%%%%%%%%

\begin{document}

%----------HEADING - 16pt bold centered----------
\begin{center}
    {\fontsize{16pt}{19pt}\selectfont\bfseries Akshay Vanaparthi} \\ \vspace{2pt}
    {\small +1 (551) 371-2572 | \href{mailto:avanapar@stevens.edu}{akshayvanaparthy@outlook.com} | Jersey City, NJ, 07304\\  \href{https://linkedin.com/in/akshay-vanaparthi}{\color{linkblue}\underline{LinkedIn}} | \href{https://github.com/akvanaparthy}{\color{linkblue}\underline{GitHub}}} | \href{https://shr.pn/AksGJM}{\color{linkblue}\underline{Design portfolio}}
\end{center}
\vspace{-8pt}

%-----------SUMMARY-----------
\section{SUMMARY}
\small{AI Engineer and full‑stack developer with hands‑on experience delivering AI‑driven web applications and solutions. Proven ability to design and deploy scalable AI agents and RAG pipelines improving data retrieval efficiency. Skilled in Typescript, Python, Java, cloud platforms (AWS, Azure, GCP), DSA  and modern web frameworks.}
\vspace{-8pt}

%-----------EDUCATION-----------
\section{EDUCATION}
  \resumeSubHeadingListStart
    \resumeEducationHeading
      {Stevens Institute of Technology}{2024 - 2025}
      {Hoboken, New Jersey}
      {Master of Science in Computer Science}
      \vspace{-6pt}
    \resumeEducationHeading
      {Sreenidhi Institute of Science and Technology}{2019 - 2023}
      {Hyderabad, Telangana}
      {Bachelor of Technology in Computer Science}
  \resumeSubHeadingListEnd

%-----------RELEVANT EXPERIENCE-----------
\section{RELEVANT EXPERIENCE}
  \resumeSubHeadingListStart

    \resumeExperienceHeading
      {WordPress Web Developer Intern | Mavenwit, Hyderabad, India}{February 2024 - July 2024}{}
      \resumeItemListStart
        \resumeItem{Delivered 3+ responsive WordPress websites that aligned with brand identities, enhancing user experience and reinforcing brand consistency.}
        \resumeItem{Optimized website functionality, security, integrations, and \textbf{SEO}; increased organic traffic by \textbf{10\%} in 3 months.}
        \resumeItem{Designed custom layouts, headers, footers, and other website elements, implemented interactive components (sliders, forms, carousels) in \textbf{Elementor}; increased \textbf{engagement by 20\%}.}
        \resumeItem{Administered hosting resources on\textbf{ AWS EC2 and S3}, configuring load balancing and monitoring to maintain 99.9\% uptime; diagnosed and resolved incidents promptly to ensure seamless \textbf{User Experience (UX)}.}
        \resumeItem{Created high-quality \textbf{UI/UX} designs using \textbf{Figma}, a collaborative design tool.}
      \resumeItemListEnd
        \vspace{-6pt}
    \resumeExperienceHeading
      {Digital Transformation Intern | Fourth Partner Energy, Hyderabad, India}{August 2023 - January 2024}{}
      \resumeItemListStart
        \resumeItem{Directed comprehensive management of \textbf{120+ IT assets} within an organization, including hardware, software, and network components ensuring efficient allocation and utilization of IT resources to support business operations.}
        \resumeItem{Applied multi‑layered security measures such as Linux firewall configuration, endpoint encryption, and regular patching to protect IT assets, resulting in zero security incidents during the internship.}
        \resumeItem{Defined and enforced policies and procedures to make sure of proper use and management of IT assets. Conducting regular audits and assessments to identify potential vulnerabilities and ensuring \textbf{100\% compliance} with established security standards.}
        \resumeItem{Deployed OS, drivers, and enterprise software and configuration.}
      \resumeItemListEnd
        \vspace{-6pt}
    \resumeExperienceHeading
      {Social Media Manager Intern | BloggerBunny, Hyderabad, India}{January 2022 - April 2022}{}
      \resumeItemListStart
        \resumeItem{Tracked and analyzed social media activity on  \textbf{3 Platforms} Instagram, Twitter, and Facebook using Hootsuite and SQL queries, uncovering audience trends that guided the content calendar.}
        \resumeItem{Analyzed campaign performance with Google Analytics and Hootsuite reports, identified under‑performing posts, and adjusted targeting, which improved overall engagement.}
        \resumeItem{Authored \textbf{SEO-friendly content} to educate users with great engagement.}
      \resumeItemListEnd
        \vspace{-6pt}
    \resumeExperienceHeading
      {Founder | SitBackTrade, Hyderabad, India}{January 2021 - March 2022}{}
      \resumeItemListStart
        \resumeItem{Founded and managed an e‑commerce startup on DigitalOcean using WordPress, Git, and Bash; launched a multi‑vendor platform that attracted early digital vendors and established the brand.}
        \resumeItem{Integrated and streamlined 3 gateways for both domestic and international support- \textbf{Stripe, Razorpay, and Coinbase commerce} cryptocurrency gateway.}
        \resumeItem{Engineered technical solution for real-world problem - \textbf{online digital stores}.}
        \resumeItem{Managed client--vendor relationships and \textbf{CRM} processes (Customer Relationship Management); executed multi-channel marketing campaigns.}
        \resumeItem{Overcame operational challenges to expand web development proficiency beyond \textbf{HTML, CSS, JS, and PHP}, utilizing \textbf{WordPress} as a key platform.}
        \resumeItem{Scaled user base to \textbf{600+ in 4 months} through targeted campaigns.}
      \resumeItemListEnd

  \resumeSubHeadingListEnd

%-----------KEY PROJECTS & PUBLICATIONS-----------
\section{KEY PROJECTS \& PUBLICATIONS}
    \resumeSubHeadingListStart
      \vspace{-3pt}
      \resumeProjectHeading
          {\textbf{Agent Jobbs -- Vision based browser agent (Ongoing)} | \emph{Node,js, Typescript, Playwright, ChromaDB, OpenAI Embeddings.}}{}
          \resumeItemListStart
            \resumeItem{Developing an \textbf{AI-powered semi-automated job application system}, a \textbf{Vision based browser agent} achieving 70\%+ match accuracy through semantic job-resume analysis, processing applications on ZipRecruiter.}
            \resumeItem{Engineered intelligent answer generation with \textbf{3 - tier confidence system}: $\geq$ 90\% auto-apply, 75-89\% user approval, $<$ 75\% human input, featuring \textbf{ChromaDB} vector search for answer reuse across applications, reducing redundant LLM calls by caching approved responses with OpenAI text-embedding-3-small.}
            \resumeItem{Integrated \textbf{dual LLM architecture} (API)- \textbf{Claude Sonnet 3.5} for high-accuracy semantic job matching on resume embeddings, \textbf{Claude Haiku 3.5} for optimized answer generation, \textbf{ReAct pattern} (Reasoning + Acting) in vision-based.}
            \resumeItem{Constructed \textbf{hybrid architecture} -- stable API-first flow (production) + vision-based agentic system (aim), automatic fallback. Maintaining 100 \% ToS compliance through human-in-loop for sub-threshold confidence answers.}
          \resumeItemListEnd

      \resumeProjectHeading
          {\textbf{SiteMind} | \emph{Next.js, React, TypeScript, Tailwind CSS, PostgreSQL, Prisma, LangChain, Pinecone, WebSocket, OpenAI}}{}
          \resumeItemListStart
            \resumeItem{Developed a first-class \textbf{AI Agent (Ops Agent)} accepting text commands (e.g., ``Refund order \#456'') to accomplish tasks -- e-commerce workflows, blog content, and support tickets, logging every action in a nested \textbf{PostgreSQL} database (Agent Log with parent-child task hierarchy). Architecture API: \textbf{RESTful API}.}
            \resumeItem{Engineered a real-time admin dashboard with \textbf{WebSocket} auto-refresh, task timelines for auditing, and live notifications, ensuring admins can monitor or override AI decisions.}
            \resumeItem{Configured \textbf{LLM -- Claude Haiku 3.5 (API Based)} with \textbf{LangChain (TS)} to enable stateful \textbf{ReAct pattern} (Reasoning + Acting) using \textbf{createToolCallingAgent} and \textbf{AgentExecutor} featuring conversational context retention (4 messages sliding window) for database queries, refunds, blog post generation, ticket management, and site control.}
            \resumeItem{Added \textbf{vector memory via Pinecone} for agent recall of prior actions/content; content generation for posts with automatic slug/excerpt and approval flow.}
          \resumeItemListEnd

      \resumeProjectHeading
          {\textbf{AI Job Master -- AI job assistant} | \emph{Next.js, React, TypeScript, Tailwind CSS, Supabase, Prisma, OpenAI, Anthropic, Gemini}}{}
          \resumeItemListStart
            \resumeItem{Architected a full-stack \textbf{AI writing platform} that generates personalized cover letters, LinkedIn outreach, and professional emails from resumes, job descriptions, and company data along with tracking and followup.}
            \resumeItem{Implemented a unified \textbf{LLM abstraction layer} that routes requests across OpenAI, Claude, and Gemini using provider-specific SDKs, reusable prompt templates, and support for both shared and per-user API keys.}
            \resumeItem{Designed a relational schema (12+ Prisma models) for users, resumes, messages, activity history, and usage limits, with \textbf{three-tier metering} (generations, follow-ups, saved activities).}
            \resumeItem{Secured the platform with \textbf{Supabase Auth + RLS}, AES-256-CBC encryption for API keys, Zod-based input validation, and server-only Next.js API routes for all AI calls,  an admin dashboard for user management, usage tuning, and analytics.}
            \resumeItem{Access: \href{https://ai-job-master.vercel.app}{\color{linkblue}\underline{AI-Job-Master.vercel.app}} .}
          \resumeItemListEnd

\vspace{8pt}
          
      \resumeProjectHeading
          {\textbf{AI Q\&A System on dataset} | \emph{Node.js, TypeScript, Express, Claude 3.5 Haiku, Pinecone, OpenAI Embeddings, Vercel}}{}
          \resumeItemListStart
            \resumeItem{Architected\textbf{ AI Q\&A system} with \textbf{RESTful API} + chat interface processing \textbf{3,349+ user messages}, achieving \textbf{92-97\% retrieval accuracy} via \textbf{adaptive semantic search}. Implemented intelligent query classification detecting entities (names, dates, locations) to dynamically adjust parameters: precision queries and broad queries \textbf{(topK=50|120, threshold=0.7|0.5}). }
            \resumeItem{Engineered\textbf{ LLM pipeline} using \textbf{Claude Haiku 3.5} API with token-optimized context management, \textbf{OpenAI text-embedding-3-small} (1536-dimension) for semantic \textbf{vector embeddings}, \textbf{Pinecone} vector database. Built \textbf{responsive UI} featuring confidence scores, source references with excerpts, and recommendations.}
            \resumeItem{Developed\textbf{ production APIs}: POST /ask, POST /reindex, GET /health, GET /stats with \textbf{2-4 second response time}.\textbf{ Full-stack implementation}: backend semantic retrieval, frontend chat interface,\textbf{ real-time query processing} }
            \resumeItem{Access: \href{https://Aurora-QA.vercel.app}{\color{linkblue}\underline{Aurora-QA.vercel.app}} .}
          \resumeItemListEnd

      \resumeProjectHeading
          {\textbf{Docugent} | \emph{Next.js, TypeScript, MongoDB, Local LLM -- LMStudio, Ngrok, RESTful API, MongoDB, Tailwind CSS, Vercel}}{}
          \resumeItemListStart
            \resumeItem{Built \textbf{Retrieval-Augmented Generation (RAG)} system for document Q\&A using local LLM integration, Information Retrieval \textbf{accuracy up to 98\%}.}
            \resumeItem{Configured \textbf{LLM -- Dolphin Mistral Nemo 2.9.3} , 13B Parameters, \textbf{Quantization -- Q4 KS}. Ngrok tunnel to expose API.}
            \resumeItem{Structured responsive UI with real time status monitoring, mobile optimization, concurrent users and isolation.}
            \resumeItem{Developed \textbf{MongoDB based session management} with auto cleanup, \textbf{MongoDB Atlas} for \textbf{Document chunking} and metadata storage. API Architecture: \textbf{RESTful API}.}
            \resumeItem{Access: \href{https://Docugent-RAG.vercel.app}{\color{linkblue}\underline{Docugent-RAG.vercel.app}} .}
          \resumeItemListEnd
          
 \resumeProjectHeading
          {\textbf{Content Creation and Publishing Automation - N8N} | \emph{n8n, Anthropic, Google Cloud Console, Cloudinary, Facebook Business}}{}
          \resumeItemListStart
            \resumeItem{Automated content creation and publishing in N8N workflow. Powered this workflow with Anthropic Claude LLM API.}
            \resumeItem{Used Facebook Business APIs for Instagram page, and Youtube APIs for content publishing. Youtube Search API for current trending content for SEO purposes.}
            \resumeItem{Access: \href{https://youtube.com/@MondayMoveons}{\color{linkblue}\underline{Youtube}}. \href{https://Instagram.com/MondayMoveOns}{\color{linkblue}\underline{Instagram}}.}
          \resumeItemListEnd
    
      \resumeProjectHeading
          {\textbf{Advanced Intelligent Video Surveillance System In Elevators} | \emph{OpenCV, Machine Learning, Python}}{}
          \resumeItemListStart
            \resumeItem{Built ML-powered surveillance system with \textbf{Haar-Cascade classifier (OpenCV)}, reducing false detections by 40\%.}
            \resumeItem{Leveraged \textbf{OpenCV} to detect motion, starts recording video and manages functioning of elevator only then.}
            \resumeItem{Published - International Research Journal of Engineering and Technology (IRJET) 10.5 (May 2023) pp.1588--1596.}
          \resumeItemListEnd

      \resumeProjectHeading
          {\textbf{Logo Detection Using AI ML} | \emph{Machine Learning, Python}}{}
          \resumeItemListStart
            \resumeItem{Designed and deployed ML-based logo detection \textbf{KNN Algorithm} (K Nearest Neighbors) with \textbf{85\% accuracy}.}
            \resumeItem{Developed logo detection mechanism compares provided logos with originals preventing ambiguity of originality.}
            \resumeItem{Published - International Research Journal of Engineering and Technology (IRJET) 9.12 (Dec. 2022) pp.1455--1461.}
          \resumeItemListEnd

      \resumeProjectHeading
          {\textbf{Credential Manager} | \emph{Flask, Python, Firebase Auth, Firestore, Cryptocode, RESTful API, CSS3, HTML5}}{}
          \resumeItemListStart
            \resumeItem{Architected zero-knowledge password manager utilizing \textbf{AES-256-GCM encryption}, \textbf{cryptocode library}, \textbf{client-side encryption}, \textbf{Scrypt KDF} (Key Derivation Function), \textbf{random salt generation}, \textbf{nonce implementation}, and \textbf{authentication tags} for credential storage including \textbf{MFA tokens} and \textbf{backup codes} via \textbf{Flask} web application.}
            \resumeItem{Engineered cryptographic workflow: User Password + Random Salt → \textbf{Scrypt KDF} → 256-bit Encryption Key | Plaintext + Encryption Key + Random Nonce → \textbf{AES-GCM} → Ciphertext + Tag | Database persistence: Salt, Ciphertext, Nonce, Tag | Decryption: reverse process with tag verification.}
            \resumeItem{Implemented \textbf{Firebase Authentication} with \textbf{email/password providers}, \textbf{JWT token} management, \textbf{OAuth2 flow}, secure session handling, and \textbf{password reset functionality} for user access control.}
            \resumeItem{Developed responsive UI using \textbf{CSS Grid}, \textbf{Flexbox layouts}, \textbf{JavaScript} event listeners, \textbf{DOM manipulation}, \textbf{AJAX} form submissions, and \textbf{Flask-WTF} integration for seamless user experience.}
            \resumeItem{Established \textbf{session management} via \textbf{Flask global variables} and \textbf{authentication middleware} for protected route access control.}
          \resumeItemListEnd

      \resumeProjectHeading
          {\textbf{Photography Spot Finder} | \emph{Node.js, Express.js, MongoDB, JavaScript, HTML, CSS, Mapbox, Cloudinary API, OAuth.}}{}
          \resumeItemListStart
            \resumeItem{Built a full-stack web application platform for users to discover, share, and map photography spots globally.}
          \resumeItemListEnd

      \resumeProjectHeading
          {\textbf{Search Engine using Trie with TF-IDF Ranking} | \emph{Python, BeautifulSoup, Regex, Web Scrape}}{}
          \resumeItemListStart
            \resumeItem{Created a \textbf{Trie-based search engine} with \textbf{TF-IDF ranking}; it crawls, cleans, and indexes multi-page datasets with computed TF-IDF scores based on ranking.}
          \resumeItemListEnd

    \resumeSubHeadingListEnd

%-----------SKILLS-----------
\section{SKILLS}
 \begin{itemize}[leftmargin=0.08in, label={}, itemsep=-3pt]
    \small{\item{
    \textbf{AI Tools / Vibe Coding:} General Development and Debugging - \textbf{Claude Code CLI}, VS Code IDE \textbf{GitHub Copilot}; Front-end Intensive: Antigravity IDE \textbf{Gemini 3 Pro}; Backend Intensive: Antigravity IDE \textbf{Opus 4.5}, \textbf{Cursor} IDE Auto; Front-end MVP Demo - \textbf{v0}, \textbf{Lovable}, \textbf{Bolt}; Research: \textbf{Perplexity Comet}; Automation: n8n.\\
     \textbf{Programming Languages / Backend Technologies}: Node.js, Typescript, Javascript, Python, Java, C, SQL, Bash. \\
     \textbf{Frontend Technologies}: React.js, Next.js, Bootstrap, HTML5/CSS3, Tailwind CSS. \\
     \textbf{Data science \& ML}: Scikit-learn, Numpy, Prompt Engineering. \\
     \textbf{Platforms / Operating Systems}: Windows 7/8/10/11, Linux, Ubuntu. \\
     \textbf{CS Foundation}: Data Structures, Algorithms, Operating Systems, Computer Architecture, Machine Learning, Agile Methodologies, Cloud Computing, Database Management Systems. \\
     \textbf{Cloud \& DevOps}: AWS (EC2, S3, Lambda, API Gateway, IAM, DynamoDB), Microsoft Azure, Docker, Kubernetes, CI/CD. \\
     \textbf{Other}: Microsoft Office, Git, GitHub, Figma UI, Adobe Illustrator, Canva, SMM.
    }}
 \end{itemize}
\vspace{-10pt}

%-----------ACHIEVEMENTS-----------
\section{ACHIEVEMENTS}
 \begin{itemize}[leftmargin=0.15in, itemsep=-3pt]
    \small{
        \item Grew Telegram community to \textbf{82,000+} subscribers.
        \item Acquired \textbf{600+} Registered vendors at own \textbf{E-commerce startup} in initial 4 months.
        \item Generated \textbf{\$1,200} revenue in 6 months with \textbf{1.4 CPC} via \textbf{Google AdSense}.
    }
 \end{itemize}
\vspace{-10pt}

%-----------CERTIFICATIONS-----------
\section{CERTIFICATIONS}
 \begin{itemize}[leftmargin=0.15in, itemsep=-3pt]
    \small{
        \item AWS Academy Graduate -- AWS Academy Machine Learning Foundations, AWS Academy Cloud Foundations, AWS Academy Cloud Architecting.
        \item PromptHero Academy -- From zero to hero in AI image generation.
        \item Internshala -- Android App Development (Kotlin).
        \item Verzeo -- Cyber Security.
        \item Meta -- Social Media Management.
        \item Udemy -- Rank blog website in google: SEO for beginners 2023, Flat art illustrations: Using Adobe Illustrator.
    }
 \end{itemize}

%-------------------------------------------
\end{document}
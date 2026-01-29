import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const sampleBlocks = [
  {
    name: "Software Engineer Internship",
    sectionType: "EXPERIENCE",
    blockType: "experience-item",
    latexContent: `\\resumeExperienceHeading
  {Software Engineer Intern}{Jun 2023 -- Aug 2023}
  {Tech Company Inc.}{San Francisco, CA}
\\resumeItemListStart
  \\resumeItem{Developed and deployed a microservice using Python and FastAPI that processed 10K+ requests daily}
  \\resumeItem{Implemented CI/CD pipeline using GitHub Actions, reducing deployment time by 40\\%}
  \\resumeItem{Collaborated with cross-functional team to design RESTful APIs following OpenAPI specification}
\\resumeItemListEnd`,
    templateData: JSON.stringify({
      position: "Software Engineer Intern",
      dates: "Jun 2023 -- Aug 2023",
      company: "Tech Company Inc.",
      location: "San Francisco, CA",
    }),
    tags: JSON.stringify(["internship", "python", "fastapi"]),
  },
  {
    name: "Full Stack Developer",
    sectionType: "EXPERIENCE",
    blockType: "experience-item",
    latexContent: `\\resumeExperienceHeading
  {Full Stack Developer}{Jan 2024 -- Present}
  {Startup Co.}{Remote}
\\resumeItemListStart
  \\resumeItem{Built responsive web applications using React, TypeScript, and Next.js serving 50K+ monthly users}
  \\resumeItem{Designed and implemented PostgreSQL database schema, optimizing query performance by 60\\%}
  \\resumeItem{Led code reviews and mentored 2 junior developers on best practices and design patterns}
\\resumeItemListEnd`,
    templateData: JSON.stringify({
      position: "Full Stack Developer",
      dates: "Jan 2024 -- Present",
      company: "Startup Co.",
      location: "Remote",
    }),
    tags: JSON.stringify(["full-stack", "react", "typescript"]),
  },
  {
    name: "Bachelor of Science in Computer Science",
    sectionType: "EDUCATION",
    blockType: "education-item",
    latexContent: `\\resumeEducationHeading
  {Bachelor of Science in Computer Science}{Aug 2020 -- May 2024}
  {University of Technology}{GPA: 3.8/4.0}
\\resumeItemListStart
  \\resumeItem{Relevant Coursework: Data Structures, Algorithms, Operating Systems, Machine Learning, Databases}
  \\resumeItem{Dean's List: Fall 2021, Spring 2022, Fall 2022}
\\resumeItemListEnd`,
    templateData: JSON.stringify({
      degree: "Bachelor of Science in Computer Science",
      dates: "Aug 2020 -- May 2024",
      school: "University of Technology",
      gpa: "3.8/4.0",
    }),
    tags: JSON.stringify(["education", "cs", "bachelor"]),
  },
  {
    name: "E-Commerce Platform",
    sectionType: "PROJECTS",
    blockType: "project-item",
    latexContent: `\\resumeProjectHeading
  {\\textbf{E-Commerce Platform} $|$ \\emph{React, Node.js, MongoDB, Stripe}}{2024}
\\resumeItemListStart
  \\resumeItem{Developed full-stack e-commerce application with user authentication, product catalog, and payment processing}
  \\resumeItem{Implemented real-time inventory management system reducing overselling incidents by 95\\%}
  \\resumeItem{Deployed on AWS using EC2, S3, and CloudFront achieving 99.9\\% uptime}
\\resumeItemListEnd`,
    templateData: JSON.stringify({
      name: "E-Commerce Platform",
      technologies: "React, Node.js, MongoDB, Stripe",
      year: "2024",
    }),
    tags: JSON.stringify(["project", "react", "node", "aws"]),
  },
  {
    name: "Machine Learning Model",
    sectionType: "PROJECTS",
    blockType: "project-item",
    latexContent: `\\resumeProjectHeading
  {\\textbf{Sentiment Analysis Tool} $|$ \\emph{Python, TensorFlow, Flask, Docker}}{2023}
\\resumeItemListStart
  \\resumeItem{Built NLP model using BERT achieving 92\\% accuracy on sentiment classification tasks}
  \\resumeItem{Created REST API with Flask for real-time inference, handling 1000+ requests per minute}
  \\resumeItem{Containerized application with Docker and deployed to Google Cloud Run}
\\resumeItemListEnd`,
    templateData: JSON.stringify({
      name: "Sentiment Analysis Tool",
      technologies: "Python, TensorFlow, Flask, Docker",
      year: "2023",
    }),
    tags: JSON.stringify(["project", "ml", "python", "nlp"]),
  },
  {
    name: "Programming Languages",
    sectionType: "SKILLS",
    blockType: "skill-category",
    latexContent: `\\textbf{Languages}{: Python, JavaScript, TypeScript, Java, C++, SQL, HTML/CSS} \\\\`,
    templateData: JSON.stringify({
      category: "Languages",
      skills: ["Python", "JavaScript", "TypeScript", "Java", "C++", "SQL", "HTML/CSS"],
    }),
    tags: JSON.stringify(["skills", "languages"]),
  },
  {
    name: "Frameworks & Tools",
    sectionType: "SKILLS",
    blockType: "skill-category",
    latexContent: `\\textbf{Frameworks}{: React, Next.js, Node.js, Express, FastAPI, Django, TensorFlow, PyTorch} \\\\`,
    templateData: JSON.stringify({
      category: "Frameworks",
      skills: ["React", "Next.js", "Node.js", "Express", "FastAPI", "Django", "TensorFlow", "PyTorch"],
    }),
    tags: JSON.stringify(["skills", "frameworks"]),
  },
  {
    name: "Developer Tools",
    sectionType: "SKILLS",
    blockType: "skill-category",
    latexContent: `\\textbf{Developer Tools}{: Git, Docker, Kubernetes, AWS, GCP, VS Code, Vim, Linux, CI/CD}`,
    templateData: JSON.stringify({
      category: "Developer Tools",
      skills: ["Git", "Docker", "Kubernetes", "AWS", "GCP", "VS Code", "Vim", "Linux", "CI/CD"],
    }),
    tags: JSON.stringify(["skills", "tools", "devops"]),
  },
  {
    name: "Hackathon Winner",
    sectionType: "ACHIEVEMENTS",
    blockType: "achievement-item",
    latexContent: `\\resumeItem{\\textbf{1st Place} at University Hackathon 2023 - Built AI-powered accessibility tool for visually impaired users}`,
    templateData: JSON.stringify({
      title: "1st Place at University Hackathon 2023",
      description: "Built AI-powered accessibility tool for visually impaired users",
    }),
    tags: JSON.stringify(["achievement", "hackathon"]),
  },
  {
    name: "AWS Certified",
    sectionType: "CERTIFICATIONS",
    blockType: "certification-item",
    latexContent: `\\resumeItem{\\textbf{AWS Solutions Architect Associate} - Amazon Web Services (2024)}`,
    templateData: JSON.stringify({
      name: "AWS Solutions Architect Associate",
      issuer: "Amazon Web Services",
      year: "2024",
    }),
    tags: JSON.stringify(["certification", "aws", "cloud"]),
  },
  {
    name: "Professional Summary",
    sectionType: "SUMMARY",
    blockType: "summary-text",
    latexContent: `Results-driven software engineer with 2+ years of experience building scalable web applications. Proficient in full-stack development with React, Node.js, and cloud technologies. Passionate about creating efficient, user-friendly solutions and mentoring junior developers.`,
    templateData: JSON.stringify({}),
    tags: JSON.stringify(["summary"]),
  },
];

async function main() {
  console.log("Seeding sample blocks...");

  for (const block of sampleBlocks) {
    await prisma.contentBlock.create({
      data: block,
    });
  }

  console.log(`Created ${sampleBlocks.length} sample blocks.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

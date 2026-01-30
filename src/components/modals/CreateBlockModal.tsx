"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Plus, FileCode, LayoutTemplate, Trash2 } from "lucide-react";
import { useBuilderStore } from "@/lib/store/builder-store";
import {
  TEMPLATE_TYPES,
  TemplateType,
  generateLatexFromTemplate,
  SummaryTemplateData,
  EducationTemplateData,
  ExperienceTemplateData,
  ProjectTemplateData,
  SkillsTemplateData,
  AchievementTemplateData,
  CertificationTemplateData,
} from "@/lib/latex/templates";

const SUGGESTED_SECTION_TYPES = [
  "PLAIN",
  "SUMMARY",
  "EDUCATION",
  "EXPERIENCE",
  "PROJECTS",
  "PUBLICATIONS",
  "SKILLS",
  "LANGUAGES",
  "ACHIEVEMENTS",
  "AWARDS",
  "CERTIFICATIONS",
];

interface CreateBlockModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type BlockMode = "plain" | "template";

export function CreateBlockModal({ open, onOpenChange }: CreateBlockModalProps) {
  const { addBlock, structure } = useBuilderStore();
  const [name, setName] = useState("");
  const [mode, setMode] = useState<BlockMode>("plain");
  const [sectionType, setSectionType] = useState<string>("EXPERIENCE");
  const [latexContent, setLatexContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCustomSection, setIsCustomSection] = useState(false);
  
  // Template mode state
  const [templateType, setTemplateType] = useState<TemplateType>("EXPERIENCE");
  
  // Template data states
  const [summaryData, setSummaryData] = useState<SummaryTemplateData>({ content: "" });
  const [educationData, setEducationData] = useState<EducationTemplateData>({
    institution: "", location: "", degree: "", dateRange: "", gpa: "", coursework: ""
  });
  const [experienceData, setExperienceData] = useState<ExperienceTemplateData>({
    jobTitle: "", company: "", location: "", dateRange: "", bulletPoints: [""]
  });
  const [projectData, setProjectData] = useState<ProjectTemplateData>({
    name: "", subtitle: "", techStack: "", bulletPoints: [""]
  });
  const [skillsData, setSkillsData] = useState<SkillsTemplateData>({
    categories: [{ name: "", skills: "" }]
  });
  const [achievementData, setAchievementData] = useState<AchievementTemplateData>({ description: "" });
  const [certificationData, setCertificationData] = useState<CertificationTemplateData>({ title: "", details: "" });

  // Combine existing sections from resume with suggested ones
  const existingSections = structure.sectionOrder;
  const allSectionTypes = Array.from(
    new Set([...existingSections, ...SUGGESTED_SECTION_TYPES])
  ).sort();

  const resetForm = () => {
    setName("");
    setLatexContent("");
    setSectionType("EXPERIENCE");
    setMode("plain");
    setTemplateType("EXPERIENCE");
    setSummaryData({ content: "" });
    setEducationData({ institution: "", location: "", degree: "", dateRange: "", gpa: "", coursework: "" });
    setExperienceData({ jobTitle: "", company: "", location: "", dateRange: "", bulletPoints: [""] });
    setProjectData({ name: "", subtitle: "", techStack: "", bulletPoints: [""] });
    setSkillsData({ categories: [{ name: "", skills: "" }] });
    setAchievementData({ description: "" });
    setCertificationData({ title: "", details: "" });
  };

  const handleSubmit = async () => {
    if (!name.trim()) return;

    let finalLatex = latexContent;
    let finalSectionType = sectionType;
    let templateDataJson: string | undefined;

    if (mode === "template") {
      // Generate LaTeX from template
      const templateInfo = TEMPLATE_TYPES[templateType];
      finalSectionType = templateInfo.sectionType;
      
      let data;
      switch (templateType) {
        case "SUMMARY": data = summaryData; break;
        case "EDUCATION": data = educationData; break;
        case "EXPERIENCE": data = experienceData; break;
        case "PROJECT": data = projectData; break;
        case "SKILLS": data = skillsData; break;
        case "ACHIEVEMENT": data = achievementData; break;
        case "CERTIFICATION": data = certificationData; break;
      }
      
      finalLatex = generateLatexFromTemplate(templateType, data);
      templateDataJson = JSON.stringify({ type: templateType, data });
    }

    if (!finalLatex.trim()) return;

    setIsSubmitting(true);
    try {
      await addBlock({
        name: name.trim(),
        sectionType: finalSectionType,
        blockType: mode === "template" ? "TEMPLATE" : "PLAIN",
        latexContent: finalLatex.trim(),
        templateData: templateDataJson,
      });

      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to create block:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTemplateTypeChange = (type: TemplateType) => {
    setTemplateType(type);
  };

  // Bullet point helpers
  const addBulletPoint = (setter: React.Dispatch<React.SetStateAction<ExperienceTemplateData>> | React.Dispatch<React.SetStateAction<ProjectTemplateData>>) => {
    (setter as React.Dispatch<React.SetStateAction<ExperienceTemplateData | ProjectTemplateData>>)((prev) => ({ ...prev, bulletPoints: [...prev.bulletPoints, ""] }));
  };

  const removeBulletPoint = (
    index: number,
    setter: React.Dispatch<React.SetStateAction<ExperienceTemplateData>> | React.Dispatch<React.SetStateAction<ProjectTemplateData>>
  ) => {
    (setter as React.Dispatch<React.SetStateAction<ExperienceTemplateData | ProjectTemplateData>>)((prev) => ({
      ...prev,
      bulletPoints: prev.bulletPoints.filter((_, i) => i !== index),
    }));
  };

  const updateBulletPoint = (
    index: number,
    value: string,
    setter: React.Dispatch<React.SetStateAction<ExperienceTemplateData>> | React.Dispatch<React.SetStateAction<ProjectTemplateData>>
  ) => {
    (setter as React.Dispatch<React.SetStateAction<ExperienceTemplateData | ProjectTemplateData>>)((prev) => ({
      ...prev,
      bulletPoints: prev.bulletPoints.map((bp, i) => (i === index ? value : bp)),
    }));
  };

  // Skills category helpers
  const addSkillCategory = () => {
    setSkillsData((prev) => ({
      categories: [...prev.categories, { name: "", skills: "" }],
    }));
  };

  const removeSkillCategory = (index: number) => {
    setSkillsData((prev) => ({
      categories: prev.categories.filter((_, i) => i !== index),
    }));
  };

  const updateSkillCategory = (index: number, field: "name" | "skills", value: string) => {
    setSkillsData((prev) => ({
      categories: prev.categories.map((cat, i) =>
        i === index ? { ...cat, [field]: value } : cat
      ),
    }));
  };

  const renderTemplateForm = () => {
    switch (templateType) {
      case "SUMMARY":
        return (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Summary Content</Label>
              <Textarea
                placeholder="Results-driven software engineer with 5+ years of experience..."
                className="h-32 text-sm bg-muted/30 border-border/40"
                value={summaryData.content}
                onChange={(e) => setSummaryData({ content: e.target.value })}
              />
            </div>
          </div>
        );

      case "EDUCATION":
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Institution</Label>
                <Input
                  placeholder="University Name"
                  className="h-9 text-sm bg-muted/30 border-border/40"
                  value={educationData.institution}
                  onChange={(e) => setEducationData({ ...educationData, institution: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Location</Label>
                <Input
                  placeholder="City, State"
                  className="h-9 text-sm bg-muted/30 border-border/40"
                  value={educationData.location}
                  onChange={(e) => setEducationData({ ...educationData, location: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Degree</Label>
                <Input
                  placeholder="Bachelor of Science in Computer Science"
                  className="h-9 text-sm bg-muted/30 border-border/40"
                  value={educationData.degree}
                  onChange={(e) => setEducationData({ ...educationData, degree: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Date Range</Label>
                <Input
                  placeholder="2020 - 2024"
                  className="h-9 text-sm bg-muted/30 border-border/40"
                  value={educationData.dateRange}
                  onChange={(e) => setEducationData({ ...educationData, dateRange: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">GPA (optional)</Label>
                <Input
                  placeholder="3.8/4.0"
                  className="h-9 text-sm bg-muted/30 border-border/40"
                  value={educationData.gpa || ""}
                  onChange={(e) => setEducationData({ ...educationData, gpa: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Coursework (optional)</Label>
                <Input
                  placeholder="Data Structures, Algorithms"
                  className="h-9 text-sm bg-muted/30 border-border/40"
                  value={educationData.coursework || ""}
                  onChange={(e) => setEducationData({ ...educationData, coursework: e.target.value })}
                />
              </div>
            </div>
          </div>
        );

      case "EXPERIENCE":
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Job Title</Label>
                <Input
                  placeholder="Software Engineer"
                  className="h-9 text-sm bg-muted/30 border-border/40"
                  value={experienceData.jobTitle}
                  onChange={(e) => setExperienceData({ ...experienceData, jobTitle: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Company</Label>
                <Input
                  placeholder="Company Name"
                  className="h-9 text-sm bg-muted/30 border-border/40"
                  value={experienceData.company}
                  onChange={(e) => setExperienceData({ ...experienceData, company: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Location</Label>
                <Input
                  placeholder="City, State"
                  className="h-9 text-sm bg-muted/30 border-border/40"
                  value={experienceData.location}
                  onChange={(e) => setExperienceData({ ...experienceData, location: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Date Range</Label>
                <Input
                  placeholder="Jan 2023 - Present"
                  className="h-9 text-sm bg-muted/30 border-border/40"
                  value={experienceData.dateRange}
                  onChange={(e) => setExperienceData({ ...experienceData, dateRange: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium">Bullet Points</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs"
                  onClick={() => addBulletPoint(setExperienceData)}
                >
                  <Plus className="h-3 w-3 mr-1" /> Add
                </Button>
              </div>
              <div className="space-y-2">
                {experienceData.bulletPoints.map((bp, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="Accomplished X by implementing Y, resulting in Z"
                      className="h-9 text-sm bg-muted/30 border-border/40 flex-1"
                      value={bp}
                      onChange={(e) => updateBulletPoint(index, e.target.value, setExperienceData)}
                    />
                    {experienceData.bulletPoints.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-9 px-2 text-destructive hover:text-destructive"
                        onClick={() => removeBulletPoint(index, setExperienceData)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "PROJECT":
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Project Name</Label>
                <Input
                  placeholder="Project Name"
                  className="h-9 text-sm bg-muted/30 border-border/40"
                  value={projectData.name}
                  onChange={(e) => setProjectData({ ...projectData, name: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Subtitle (optional)</Label>
                <Input
                  placeholder="Personal Project"
                  className="h-9 text-sm bg-muted/30 border-border/40"
                  value={projectData.subtitle || ""}
                  onChange={(e) => setProjectData({ ...projectData, subtitle: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Tech Stack</Label>
              <Input
                placeholder="React, Node.js, TypeScript, PostgreSQL"
                className="h-9 text-sm bg-muted/30 border-border/40"
                value={projectData.techStack}
                onChange={(e) => setProjectData({ ...projectData, techStack: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium">Bullet Points</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs"
                  onClick={() => addBulletPoint(setProjectData)}
                >
                  <Plus className="h-3 w-3 mr-1" /> Add
                </Button>
              </div>
              <div className="space-y-2">
                {projectData.bulletPoints.map((bp, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="Built a feature that does X"
                      className="h-9 text-sm bg-muted/30 border-border/40 flex-1"
                      value={bp}
                      onChange={(e) => updateBulletPoint(index, e.target.value, setProjectData)}
                    />
                    {projectData.bulletPoints.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-9 px-2 text-destructive hover:text-destructive"
                        onClick={() => removeBulletPoint(index, setProjectData)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "SKILLS":
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium">Skill Categories</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 text-xs"
                onClick={addSkillCategory}
              >
                <Plus className="h-3 w-3 mr-1" /> Add Category
              </Button>
            </div>
            <div className="space-y-3">
              {skillsData.categories.map((cat, index) => (
                <div key={index} className="flex gap-2">
                  <div className="flex-1 grid grid-cols-[1fr_2fr] gap-2">
                    <Input
                      placeholder="Category Name"
                      className="h-9 text-sm bg-muted/30 border-border/40"
                      value={cat.name}
                      onChange={(e) => updateSkillCategory(index, "name", e.target.value)}
                    />
                    <Input
                      placeholder="Skill 1, Skill 2, Skill 3"
                      className="h-9 text-sm bg-muted/30 border-border/40"
                      value={cat.skills}
                      onChange={(e) => updateSkillCategory(index, "skills", e.target.value)}
                    />
                  </div>
                  {skillsData.categories.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-9 px-2 text-destructive hover:text-destructive"
                      onClick={() => removeSkillCategory(index)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case "ACHIEVEMENT":
        return (
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Achievement Description</Label>
            <Input
              placeholder="Awarded Best Project for innovative AI solution"
              className="h-9 text-sm bg-muted/30 border-border/40"
              value={achievementData.description}
              onChange={(e) => setAchievementData({ description: e.target.value })}
            />
          </div>
        );

      case "CERTIFICATION":
        return (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Certification Title</Label>
              <Input
                placeholder="AWS Certified Solutions Architect"
                className="h-9 text-sm bg-muted/30 border-border/40"
                value={certificationData.title}
                onChange={(e) => setCertificationData({ ...certificationData, title: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Details (optional)</Label>
              <Input
                placeholder="Amazon Web Services, 2024"
                className="h-9 text-sm bg-muted/30 border-border/40"
                value={certificationData.details || ""}
                onChange={(e) => setCertificationData({ ...certificationData, details: e.target.value })}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-background/95 backdrop-blur-xl border-border/60">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Plus className="h-4 w-4 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-base">Create New Block</DialogTitle>
              <DialogDescription className="text-xs mt-0.5">
                Create a reusable LaTeX content block for your resume.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Block Name */}
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-xs font-medium">Block Name</Label>
            <Input
              id="name"
              placeholder="e.g., My Work Experience"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-9 text-sm bg-muted/30 border-border/40 focus:bg-background"
            />
          </div>

          {/* Mode Selection */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Block Type</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={mode === "plain" ? "default" : "outline"}
                className="h-16 flex-col gap-1"
                onClick={() => setMode("plain")}
              >
                <FileCode className="h-5 w-5" />
                <span className="text-xs">Plain LaTeX</span>
              </Button>
              <Button
                type="button"
                variant={mode === "template" ? "default" : "outline"}
                className="h-16 flex-col gap-1"
                onClick={() => setMode("template")}
              >
                <LayoutTemplate className="h-5 w-5" />
                <span className="text-xs">Template</span>
              </Button>
            </div>
          </div>

          {mode === "plain" ? (
            <>
              {/* Section Type for Plain */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Section Type</Label>
                {isCustomSection ? (
                  <div className="flex gap-1">
                    <Input
                      placeholder="CUSTOM SECTION"
                      value={sectionType}
                      onChange={(e) => setSectionType(e.target.value.toUpperCase())}
                      className="h-9 text-sm bg-muted/30 border-border/40 uppercase flex-1"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 px-2"
                      onClick={() => {
                        setIsCustomSection(false);
                        setSectionType("EXPERIENCE");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full justify-between h-9 text-sm border-border/40 bg-muted/30 hover:bg-muted/50">
                        {sectionType}
                        <ChevronDown className="h-3.5 w-3.5 ml-2 opacity-50" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-48">
                      {allSectionTypes.map((type) => (
                        <DropdownMenuItem
                          key={type}
                          onClick={() => setSectionType(type)}
                        >
                          {type}
                        </DropdownMenuItem>
                      ))}
                      <div className="h-px bg-border my-1" />
                      <DropdownMenuItem onClick={() => setIsCustomSection(true)}>
                        <Plus className="h-3.5 w-3.5 mr-2 text-primary" />
                        <span className="text-primary font-medium">Custom...</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              {/* LaTeX Content */}
              <div className="space-y-1.5">
                <Label htmlFor="latex" className="text-xs font-medium">LaTeX Content</Label>
                <Textarea
                  id="latex"
                  placeholder={`\\resumeExperienceHeading
  {Software Engineer | Company Name, Location}{Jan 2024 - Present}{}
  \\resumeItemListStart
    \\resumeItem{Built awesome things}
  \\resumeItemListEnd`}
                  className="font-mono text-xs h-56 bg-muted/30 border-border/40 focus:bg-background leading-relaxed resize-none"
                  value={latexContent}
                  onChange={(e) => setLatexContent(e.target.value)}
                />
                <p className="text-[10px] text-muted-foreground">
                  Enter raw LaTeX code for this content block. Use your resume template&apos;s custom commands.
                </p>
              </div>
            </>
          ) : (
            <>
              {/* Template Type Selection */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Template Type</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between h-9 text-sm border-border/40 bg-muted/30 hover:bg-muted/50">
                      {TEMPLATE_TYPES[templateType].label}
                      <ChevronDown className="h-3.5 w-3.5 ml-2 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-48">
                    {(Object.keys(TEMPLATE_TYPES) as TemplateType[]).map((type) => (
                      <DropdownMenuItem
                        key={type}
                        onClick={() => handleTemplateTypeChange(type)}
                      >
                        {TEMPLATE_TYPES[type].label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <p className="text-[10px] text-muted-foreground">
                  Will be added to the {TEMPLATE_TYPES[templateType].sectionType} section
                </p>
              </div>

              {/* Template Form */}
              <div className="pt-2 border-t border-border/40">
                {renderTemplateForm()}
              </div>
            </>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="h-8 text-xs border-border/40">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!name.trim() || (mode === "plain" && !latexContent.trim()) || isSubmitting}
            className="h-8 text-xs min-w-[110px]"
          >
            {isSubmitting ? "Creating..." : "Create Block"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User } from "lucide-react";

interface HeaderData {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  website: string;
}

interface HeaderSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  headerData: HeaderData;
  onSave: (data: HeaderData) => void;
}

export function HeaderSettingsModal({
  open,
  onOpenChange,
  headerData,
  onSave,
}: HeaderSettingsModalProps) {
  const [formData, setFormData] = useState<HeaderData>(headerData);

  useEffect(() => {
    setFormData(headerData);
  }, [headerData]);

  const handleChange = (field: keyof HeaderData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onOpenChange(false);
  };

  const fields: { key: keyof HeaderData; label: string; placeholder: string; type?: string; span?: number }[] = [
    { key: "name", label: "Full Name", placeholder: "John Doe", span: 2 },
    { key: "email", label: "Email", placeholder: "john@example.com", type: "email" },
    { key: "phone", label: "Phone", placeholder: "+1 (555) 123-4567" },
    { key: "location", label: "Location", placeholder: "San Francisco, CA", span: 2 },
    { key: "linkedin", label: "LinkedIn URL", placeholder: "https://linkedin.com/in/johndoe", span: 2 },
    { key: "github", label: "GitHub URL", placeholder: "https://github.com/johndoe", span: 2 },
    { key: "website", label: "Portfolio / Website", placeholder: "https://johndoe.dev", span: 2 },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-background/95 backdrop-blur-xl border-border/60">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <User className="h-4 w-4 text-primary" />
            </div>
            <DialogTitle className="text-base">Resume Header</DialogTitle>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="pt-1">
          <div className="grid grid-cols-2 gap-3">
            {fields.map(({ key, label, placeholder, type, span }) => (
              <div key={key} className={`space-y-1.5 ${span === 2 ? "col-span-2" : ""}`}>
                <Label htmlFor={key} className="text-xs font-medium">{label}</Label>
                <Input
                  id={key}
                  type={type || "text"}
                  value={formData[key]}
                  onChange={(e) => handleChange(key, e.target.value)}
                  placeholder={placeholder}
                  className="h-9 text-sm bg-muted/30 border-border/40 focus:bg-background"
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-5">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-8 text-xs border-border/40"
            >
              Cancel
            </Button>
            <Button type="submit" className="h-8 text-xs min-w-[110px]">
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

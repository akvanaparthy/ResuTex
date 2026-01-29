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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Resume Header Settings</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="John Doe"
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="john@example.com"
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleChange("location", e.target.value)}
                placeholder="San Francisco, CA"
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="linkedin">LinkedIn URL</Label>
              <Input
                id="linkedin"
                value={formData.linkedin}
                onChange={(e) => handleChange("linkedin", e.target.value)}
                placeholder="https://linkedin.com/in/johndoe"
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="github">GitHub URL</Label>
              <Input
                id="github"
                value={formData.github}
                onChange={(e) => handleChange("github", e.target.value)}
                placeholder="https://github.com/johndoe"
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="website">Portfolio/Website URL</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => handleChange("website", e.target.value)}
                placeholder="https://johndoe.dev"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

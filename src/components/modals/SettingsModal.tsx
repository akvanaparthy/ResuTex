"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Database, FileText, AlertTriangle, Bot, Key, Loader2, Check } from "lucide-react";
import { useBuilderStore, AIConfig } from "@/lib/store/builder-store";
import { useToast } from "@/hooks/use-toast";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ModelInfo {
  id: string;
  name: string;
}

const PROVIDERS = [
  { id: "openai", name: "OpenAI", placeholder: "sk-..." },
  { id: "anthropic", name: "Anthropic", placeholder: "sk-ant-..." },
  { id: "gemini", name: "Google Gemini", placeholder: "AIza..." },
] as const;

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const { settings, setSharedBlocks, setAIConfig, blocks, documentId } = useBuilderStore();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [pendingChange, setPendingChange] = useState<boolean | null>(null);

  // AI Config state
  const [aiProvider, setAiProvider] = useState<"openai" | "anthropic" | "gemini" | "">("");
  const [aiApiKey, setAiApiKey] = useState("");
  const [aiModel, setAiModel] = useState("");
  const [availableModels, setAvailableModels] = useState<ModelInfo[]>([]);
  const [isFetchingModels, setIsFetchingModels] = useState(false);
  const [isSavingAI, setIsSavingAI] = useState(false);

  // Count blocks specific to current document vs shared
  const documentBlocks = blocks.filter((b) => b.documentId === documentId);
  const sharedBlocks = blocks.filter((b) => !b.documentId);

  useEffect(() => {
    if (open) {
      setPendingChange(null);
      // Load current AI config
      if (settings.aiConfig.provider) {
        setAiProvider(settings.aiConfig.provider);
        setAiApiKey(settings.aiConfig.apiKey || "");
        setAiModel(settings.aiConfig.model || "");
      }
    }
  }, [open, settings.aiConfig]);

  const handleToggleSharedBlocks = async (shared: boolean) => {
    if (!shared && sharedBlocks.length > 0) {
      setPendingChange(shared);
      return;
    }
    await applyChange(shared);
  };

  const applyChange = async (shared: boolean) => {
    setIsUpdating(true);
    try {
      await setSharedBlocks(shared);
      toast({
        title: "Settings Updated",
        description: shared
          ? "Blocks are now shared across all resumes."
          : "Blocks are now isolated per resume.",
      });
      setPendingChange(null);
    } catch {
      toast({
        title: "Error",
        description: "Failed to update settings.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleProviderChange = (provider: "openai" | "anthropic" | "gemini") => {
    setAiProvider(provider);
    setAiApiKey("");
    setAiModel("");
    setAvailableModels([]);
  };

  const handleFetchModels = async () => {
    if (!aiProvider || !aiApiKey) {
      toast({
        title: "Missing Information",
        description: "Please select a provider and enter an API key.",
        variant: "destructive",
      });
      return;
    }

    setIsFetchingModels(true);
    try {
      const response = await fetch("/api/ai-models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: aiProvider, apiKey: aiApiKey }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch models");
      }

      setAvailableModels(data.models);
      if (data.models.length > 0 && !aiModel) {
        setAiModel(data.models[0].id);
      }

      toast({
        title: "Models Fetched",
        description: `Found ${data.models.length} available models.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch models",
        variant: "destructive",
      });
    } finally {
      setIsFetchingModels(false);
    }
  };

  const handleSaveAIConfig = async () => {
    if (!aiProvider || !aiApiKey || !aiModel) {
      toast({
        title: "Missing Information",
        description: "Please complete all AI configuration fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSavingAI(true);
    try {
      const config: AIConfig = {
        provider: aiProvider,
        apiKey: aiApiKey,
        model: aiModel,
      };
      await setAIConfig(config);
      toast({
        title: "AI Configuration Saved",
        description: `Using ${PROVIDERS.find(p => p.id === aiProvider)?.name} with ${aiModel}`,
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to save AI configuration.",
        variant: "destructive",
      });
    } finally {
      setIsSavingAI(false);
    }
  };

  const isAIConfigured = settings.aiConfig.provider && settings.aiConfig.apiKey && settings.aiConfig.model;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure how ResuTex manages your content blocks and AI features.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Block Storage Mode */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Database className="h-4 w-4 text-primary" />
                  Shared Block Library
                </Label>
                <p className="text-xs text-muted-foreground">
                  When enabled, all blocks are shared across resumes.
                </p>
              </div>
              <Switch
                checked={settings.sharedBlocks}
                onCheckedChange={handleToggleSharedBlocks}
                disabled={isUpdating}
              />
            </div>

            {/* Status indicator */}
            <div className="p-3 rounded-lg border border-border/40 bg-muted/30">
              <div className="flex items-start gap-3">
                {settings.sharedBlocks ? (
                  <>
                    <div className="p-1.5 rounded bg-primary/10">
                      <Database className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Global Library Mode</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        All {sharedBlocks.length} blocks are available in every resume.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-1.5 rounded bg-orange-500/10">
                      <FileText className="h-4 w-4 text-orange-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Isolated Mode</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Each resume has its own block library.
                        {documentBlocks.length > 0 && (
                          <span> Current document has {documentBlocks.length} blocks.</span>
                        )}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Warning dialog for mode change */}
          {pendingChange === false && sharedBlocks.length > 0 && (
            <div className="p-3 rounded-lg border border-amber-500/40 bg-amber-500/10">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1 space-y-3">
                  <div>
                    <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                      Switching to Isolated Mode
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      You have {sharedBlocks.length} shared blocks. New blocks will only belong to the current document.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPendingChange(null)}
                      disabled={isUpdating}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => applyChange(false)}
                      disabled={isUpdating}
                    >
                      {isUpdating ? "Switching..." : "Switch Anyway"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AI Configuration Section */}
          <div className="border-t border-border/40 pt-4">
            <div className="flex items-center gap-2 mb-4">
              <Bot className="h-4 w-4 text-primary" />
              <Label className="text-sm font-medium">AI Configuration</Label>
              {isAIConfigured && (
                <div className="ml-auto flex items-center gap-1 text-xs text-green-600">
                  <Check className="h-3 w-3" />
                  Configured
                </div>
              )}
            </div>

            <div className="space-y-3">
              {/* Provider Selection */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Provider</Label>
                <Select value={aiProvider} onValueChange={handleProviderChange}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select AI provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROVIDERS.map((provider) => (
                      <SelectItem key={provider.id} value={provider.id}>
                        {provider.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* API Key Input */}
              {aiProvider && (
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground flex items-center gap-1">
                    <Key className="h-3 w-3" />
                    API Key
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      type="password"
                      value={aiApiKey}
                      onChange={(e) => setAiApiKey(e.target.value)}
                      placeholder={PROVIDERS.find(p => p.id === aiProvider)?.placeholder}
                      className="h-9 flex-1"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleFetchModels}
                      disabled={!aiApiKey || isFetchingModels}
                      className="h-9"
                    >
                      {isFetchingModels ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Fetch"
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Model Selection */}
              {availableModels.length > 0 && (
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Model</Label>
                  <Select value={aiModel} onValueChange={setAiModel}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableModels.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Save Button */}
              {aiModel && (
                <Button
                  onClick={handleSaveAIConfig}
                  disabled={isSavingAI || !aiProvider || !aiApiKey || !aiModel}
                  className="w-full h-9"
                >
                  {isSavingAI ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save AI Configuration"
                  )}
                </Button>
              )}

              {/* Current config info */}
              {isAIConfigured && !aiProvider && (
                <div className="p-2 rounded bg-muted/50 text-xs text-muted-foreground">
                  <p>
                    Currently using: {PROVIDERS.find(p => p.id === settings.aiConfig.provider)?.name} / {settings.aiConfig.model}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

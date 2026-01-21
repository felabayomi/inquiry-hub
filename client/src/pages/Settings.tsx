import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { useSettings, useUpdateSetting } from "@/hooks/use-settings";
import { useReportSections, useCreateSection, useUpdateSection, useDeleteSection, useJusticeLenses, useCreateJusticeLens, useUpdateJusticeLens, useDeleteJusticeLens } from "@/hooks/use-report";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Plus, FileText, Trash2, Pencil, ChevronUp, ChevronDown, BookOpen, Scale, Bot, Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import type { JusticeLens } from "@shared/schema";

export default function Settings() {
  const { data: settings, isLoading: settingsLoading } = useSettings();
  const { mutate: updateSetting } = useUpdateSetting();
  const { data: sections, isLoading: sectionsLoading } = useReportSections();
  const { mutate: createSection, isPending: isCreatingSection } = useCreateSection();
  const { mutate: updateSection } = useUpdateSection();
  const { mutate: deleteSection } = useDeleteSection();
  const { data: lenses, isLoading: lensesLoading } = useJusticeLenses();
  const { mutate: createLens, isPending: isCreatingLens } = useCreateJusticeLens();
  const { mutate: updateLens } = useUpdateJusticeLens();
  const { mutate: deleteLens } = useDeleteJusticeLens();
  const { toast } = useToast();

  const [newSection, setNewSection] = useState({
    title: "",
    slug: "",
    description: "",
    orderIndex: 0
  });

  const [editingSection, setEditingSection] = useState<number | null>(null);
  
  const [newLens, setNewLens] = useState({
    label: "",
    slug: "",
    orderIndex: 0
  });
  const [editingLens, setEditingLens] = useState<JusticeLens | null>(null);
  const [editLensForm, setEditLensForm] = useState({ label: "", slug: "" });

  // AI Reindex mutation
  const reindexMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/ai/reindex');
      return res.json();
    },
    onSuccess: (data) => {
      toast({ 
        title: "Content reindexed for AI",
        description: `Indexed ${data.indexed?.versions || 0} posts and ${data.indexed?.reflections || 0} reflections`
      });
    },
    onError: (error: Error) => {
      toast({ title: error.message, variant: "destructive" });
    },
  });

  const getSetting = (key: string) => settings?.find(s => s.key === key)?.value || "";

  const handleUpdate = (key: string, value: string) => {
    updateSetting({ key, value });
  };

  const handleCreateSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSection.title || !newSection.slug) return;
    const nextOrder = (sections?.length || 0) + 1;
    createSection({
      ...newSection,
      orderIndex: nextOrder,
    }, {
      onSuccess: () => {
        setNewSection({ title: "", slug: "", description: "", orderIndex: 0 });
      }
    });
  };

  const handleDeleteSection = (id: number) => {
    deleteSection(id);
  };

  const handleMoveSection = (sectionId: number, direction: 'up' | 'down') => {
    if (!sections) return;
    const sortedSections = [...sections].sort((a, b) => a.orderIndex - b.orderIndex);
    const currentIndex = sortedSections.findIndex(s => s.id === sectionId);
    if (currentIndex === -1) return;
    
    const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (swapIndex < 0 || swapIndex >= sortedSections.length) return;
    
    const currentSection = sortedSections[currentIndex];
    const swapSection = sortedSections[swapIndex];
    
    updateSection({ id: currentSection.id, data: { orderIndex: swapSection.orderIndex } });
    updateSection({ id: swapSection.id, data: { orderIndex: currentSection.orderIndex } });
  };

  const handleCreateLens = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLens.label || !newLens.slug) return;
    const nextOrder = (lenses?.length || 0) + 1;
    createLens({
      ...newLens,
      orderIndex: nextOrder,
    }, {
      onSuccess: () => {
        setNewLens({ label: "", slug: "", orderIndex: 0 });
      }
    });
  };

  const handleDeleteLens = (id: number) => {
    deleteLens(id);
  };

  const openEditLensDialog = (lens: JusticeLens) => {
    setEditingLens(lens);
    setEditLensForm({ label: lens.label, slug: lens.slug });
  };

  const handleSaveLens = () => {
    if (!editingLens || !editLensForm.label || !editLensForm.slug) return;
    updateLens({ 
      id: editingLens.id, 
      data: { 
        label: editLensForm.label, 
        slug: editLensForm.slug,
        orderIndex: editingLens.orderIndex 
      } 
    }, {
      onSuccess: () => {
        setEditingLens(null);
      }
    });
  };

  if (settingsLoading || sectionsLoading || lensesLoading) return <PageLayout title="Settings">Loading...</PageLayout>;

  return (
    <PageLayout title="Settings" description="Configure your research journal.">
      <div className="max-w-4xl space-y-8 pb-12">
        {/* Project Configuration */}
        <Card className="paper-card">
          <CardHeader>
            <CardTitle className="text-xl font-serif">Project Timeline</CardTitle>
            <CardDescription>Set your research project dates.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input 
                  type="date"
                  defaultValue={getSetting("cohort_start")}
                  onChange={(e) => handleUpdate("cohort_start", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input 
                  type="date"
                  defaultValue={getSetting("cohort_end")}
                  onChange={(e) => handleUpdate("cohort_end", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Document Sections Management */}
        <Card className="paper-card">
          <CardHeader>
            <CardTitle className="text-xl font-serif">Document Sections</CardTitle>
            <CardDescription>Organize your research documents with custom sections.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <form onSubmit={handleCreateSection} className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border rounded-lg bg-slate-50/50">
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><BookOpen className="h-4 w-4" /> Section Title</Label>
                <Input 
                  placeholder="e.g. Key Insights" 
                  value={newSection.title}
                  onChange={(e) => setNewSection({ ...newSection, title: e.target.value })}
                  required
                  data-testid="input-section-title"
                />
              </div>
              <div className="space-y-2">
                <Label>Slug (URL-friendly)</Label>
                <Input 
                  placeholder="e.g. key-insights" 
                  value={newSection.slug}
                  onChange={(e) => setNewSection({ ...newSection, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                  required
                  data-testid="input-section-slug"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Description (optional)</Label>
                <Input 
                  placeholder="Instructions or prompts for this section" 
                  value={newSection.description}
                  onChange={(e) => setNewSection({ ...newSection, description: e.target.value })}
                  data-testid="input-section-description"
                />
              </div>
              <Button type="submit" className="md:col-span-2 mt-2" disabled={isCreatingSection} data-testid="button-add-section">
                <Plus className="mr-2 h-4 w-4" /> Add Section
              </Button>
            </form>

            <div className="space-y-4">
              <h3 className="font-serif text-lg font-bold">Current Sections</h3>
              <div className="space-y-2">
                {sections?.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">No sections created yet.</p>
                ) : (
                  sections?.sort((a,b) => a.orderIndex - b.orderIndex).map((section, index, arr) => (
                    <div key={section.id} className="flex items-center justify-between p-4 border rounded-lg gap-4 bg-white" data-testid={`section-item-${section.id}`}>
                      <div className="flex items-center gap-3 flex-1">
                        <div className="flex flex-col">
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-5 w-5"
                            onClick={() => handleMoveSection(section.id, 'up')}
                            disabled={index === 0}
                            data-testid={`button-move-up-section-${section.id}`}
                          >
                            <ChevronUp className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-5 w-5"
                            onClick={() => handleMoveSection(section.id, 'down')}
                            disabled={index === arr.length - 1}
                            data-testid={`button-move-down-section-${section.id}`}
                          >
                            <ChevronDown className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="flex-1">
                          {editingSection === section.id ? (
                            <Input 
                              defaultValue={section.title}
                              className="h-8"
                              onBlur={(e) => {
                                updateSection({ id: section.id, data: { title: e.target.value } });
                                setEditingSection(null);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  updateSection({ id: section.id, data: { title: e.currentTarget.value } });
                                  setEditingSection(null);
                                }
                              }}
                              autoFocus
                            />
                          ) : (
                            <>
                              <p className="font-medium text-slate-900">{section.title}</p>
                              <p className="text-xs text-muted-foreground">{section.slug}</p>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          onClick={() => setEditingSection(section.id)}
                          data-testid={`button-edit-section-${section.id}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" data-testid={`button-delete-section-${section.id}`}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Section?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete "{section.title}" and all its content. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteSection(section.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Analysis Tags */}
        <Card className="paper-card">
          <CardHeader>
            <CardTitle className="text-xl font-serif">Analysis Tags</CardTitle>
            <CardDescription>Create tags to categorize your research insights.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <form onSubmit={handleCreateLens} className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border rounded-lg bg-slate-50/50">
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><Scale className="h-4 w-4" /> Tag Label</Label>
                <Input 
                  placeholder="e.g. Key Finding" 
                  value={newLens.label}
                  onChange={(e) => setNewLens({ ...newLens, label: e.target.value })}
                  required
                  data-testid="input-lens-label"
                />
              </div>
              <div className="space-y-2">
                <Label>Slug (ID)</Label>
                <Input 
                  placeholder="e.g. key_finding" 
                  value={newLens.slug}
                  onChange={(e) => setNewLens({ ...newLens, slug: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                  required
                  data-testid="input-lens-slug"
                />
              </div>
              <Button type="submit" className="md:col-span-2 mt-2" disabled={isCreatingLens} data-testid="button-add-lens">
                <Plus className="mr-2 h-4 w-4" /> Add Tag
              </Button>
            </form>

            <div className="space-y-4">
              <h3 className="font-serif text-lg font-bold">Current Tags</h3>
              <div className="space-y-2">
                {lenses?.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">No tags created yet.</p>
                ) : (
                  lenses?.sort((a,b) => a.orderIndex - b.orderIndex).map((lens) => (
                    <div key={lens.id} className="flex items-center justify-between p-4 border rounded-lg gap-4 bg-white" data-testid={`lens-item-${lens.id}`}>
                      <div className="flex items-center gap-3 flex-1">
                        <Scale className="h-4 w-4 text-primary" />
                        <div className="flex-1">
                          <p className="font-medium text-slate-900">{lens.label}</p>
                          <p className="text-xs text-muted-foreground">{lens.slug}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          onClick={() => openEditLensDialog(lens)}
                          data-testid={`button-edit-lens-${lens.id}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" data-testid={`button-delete-lens-${lens.id}`}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Tag?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete "{lens.label}". This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteLens(lens.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Configuration */}
        <Card className="paper-card">
          <CardHeader>
            <CardTitle className="text-xl font-serif flex items-center gap-2">
              <Bot className="h-5 w-5" /> AI Configuration
            </CardTitle>
            <CardDescription>Manage AI-powered features.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border rounded-lg bg-slate-50/50">
              <h4 className="font-medium mb-2">Reindex Content</h4>
              <p className="text-sm text-muted-foreground mb-4">
                If AI insights seem outdated, you can reindex all content to refresh the AI's knowledge.
              </p>
              <Button 
                onClick={() => reindexMutation.mutate()}
                disabled={reindexMutation.isPending}
                variant="outline"
              >
                {reindexMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Reindex All Content
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Edit Lens Dialog */}
        <Dialog open={!!editingLens} onOpenChange={() => setEditingLens(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Tag</DialogTitle>
              <DialogDescription>Update the tag label and slug.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Label</Label>
                <Input 
                  value={editLensForm.label}
                  onChange={(e) => setEditLensForm({ ...editLensForm, label: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input 
                  value={editLensForm.slug}
                  onChange={(e) => setEditLensForm({ ...editLensForm, slug: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingLens(null)}>Cancel</Button>
              <Button onClick={handleSaveLens}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageLayout>
  );
}

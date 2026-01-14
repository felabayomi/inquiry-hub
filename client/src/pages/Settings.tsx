import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { useSettings, useUpdateSetting } from "@/hooks/use-settings";
import { useMeetings, useCreateMeeting, useUpdateMeeting } from "@/hooks/use-meetings";
import { useReportSections, useCreateSection, useUpdateSection, useDeleteSection, useJusticeLenses, useCreateJusticeLens, useUpdateJusticeLens, useDeleteJusticeLens } from "@/hooks/use-report";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Plus, ExternalLink, Calendar, Video, Clock, FileText, Trash2, Pencil, GripVertical, BookOpen, Scale } from "lucide-react";
import { format } from "date-fns";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import type { JusticeLens } from "@shared/schema";

export default function Settings() {
  const { data: settings, isLoading: settingsLoading } = useSettings();
  const { mutate: updateSetting } = useUpdateSetting();
  const { data: meetings, isLoading: meetingsLoading } = useMeetings();
  const { mutate: createMeeting } = useCreateMeeting();
  const { mutate: updateMeeting } = useUpdateMeeting();
  const { data: sections, isLoading: sectionsLoading } = useReportSections();
  const { mutate: createSection, isPending: isCreatingSection } = useCreateSection();
  const { mutate: updateSection } = useUpdateSection();
  const { mutate: deleteSection } = useDeleteSection();
  const { data: lenses, isLoading: lensesLoading } = useJusticeLenses();
  const { mutate: createLens, isPending: isCreatingLens } = useCreateJusticeLens();
  const { mutate: updateLens } = useUpdateJusticeLens();
  const { mutate: deleteLens } = useDeleteJusticeLens();
  const { toast } = useToast();

  const [newMeeting, setNewMeeting] = useState({
    title: "",
    date: "",
    zoomLink: "",
    agenda: ""
  });

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

  const getSetting = (key: string) => settings?.find(s => s.key === key)?.value || "";

  const handleUpdate = (key: string, value: string) => {
    updateSetting({ key, value });
  };

  const handleCreateMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMeeting.title || !newMeeting.date) return;
    createMeeting({
      ...newMeeting,
      date: new Date(newMeeting.date).toISOString(),
    }, {
      onSuccess: () => {
        setNewMeeting({ title: "", date: "", zoomLink: "", agenda: "" });
      }
    });
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

  if (settingsLoading || meetingsLoading || sectionsLoading || lensesLoading) return <PageLayout title="Settings">Loading...</PageLayout>;

  return (
    <PageLayout title="Admin Settings" description="Configure global application parameters.">
      <div className="max-w-4xl space-y-8 pb-12">
        {/* Cohort Configuration */}
        <Card className="paper-card">
          <CardHeader>
            <CardTitle className="text-xl font-serif">Cohort Configuration</CardTitle>
            <CardDescription>Basic information for the current cohort.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Cohort Name</Label>
              <Input 
                defaultValue={getSetting("cohort_name")}
                onBlur={(e) => handleUpdate("cohort_name", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Cohort Start Date</Label>
                <Input 
                  type="date"
                  defaultValue={getSetting("cohort_start")}
                  onChange={(e) => handleUpdate("cohort_start", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Cohort End Date</Label>
                <Input 
                  type="date"
                  defaultValue={getSetting("cohort_end")}
                  onChange={(e) => handleUpdate("cohort_end", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Meeting Management */}
        <Card className="paper-card">
          <CardHeader>
            <CardTitle className="text-xl font-serif">Meeting Management</CardTitle>
            <CardDescription>Schedule and update cohort meetings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <form onSubmit={handleCreateMeeting} className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border rounded-lg bg-slate-50/50">
              <div className="space-y-2 md:col-span-2">
                <Label className="flex items-center gap-2"><FileText className="h-4 w-4" /> Meeting Title</Label>
                <Input 
                  placeholder="e.g. Midpoint Review" 
                  value={newMeeting.title}
                  onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><Clock className="h-4 w-4" /> Date & Time</Label>
                <Input 
                  type="datetime-local" 
                  value={newMeeting.date}
                  onChange={(e) => setNewMeeting({ ...newMeeting, date: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><Video className="h-4 w-4" /> Zoom Link</Label>
                <Input 
                  placeholder="https://zoom.us/j/..." 
                  value={newMeeting.zoomLink}
                  onChange={(e) => setNewMeeting({ ...newMeeting, zoomLink: e.target.value })}
                />
              </div>
              <Button type="submit" className="md:col-span-2 mt-2">
                <Plus className="mr-2 h-4 w-4" /> Schedule Meeting
              </Button>
            </form>

            <div className="space-y-4">
              <h3 className="font-serif text-lg font-bold">Scheduled Meetings</h3>
              <div className="space-y-3">
                {meetings?.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">No meetings scheduled yet.</p>
                ) : (
                  meetings?.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((meeting) => (
                    <div key={meeting.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg gap-4 bg-white">
                      <div className="flex-1">
                        <p className="font-bold text-slate-900">{meeting.title}</p>
                        <p className="text-sm text-primary font-medium flex items-center gap-1.5 mt-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {format(new Date(meeting.date), "PPP p")}
                        </p>
                      </div>
                      <div className="flex-1 max-w-md">
                        <Label className="text-[10px] uppercase tracking-wider text-slate-500 mb-1 block">Zoom Link</Label>
                        <div className="flex gap-2">
                          <Input 
                            placeholder="Paste Zoom link here" 
                            className="h-9 text-sm"
                            defaultValue={meeting.zoomLink || ""}
                            onBlur={(e) => updateMeeting({ id: meeting.id, zoomLink: e.target.value })}
                          />
                          {meeting.zoomLink && (
                            <Button size="icon" variant="outline" className="h-9 w-9 shrink-0" asChild>
                              <a href={meeting.zoomLink} target="_blank" rel="noreferrer">
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Report Sections Management */}
        <Card className="paper-card">
          <CardHeader>
            <CardTitle className="text-xl font-serif">Report Sections</CardTitle>
            <CardDescription>Manage sections for the collaborative report.</CardDescription>
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
                  sections?.sort((a,b) => a.orderIndex - b.orderIndex).map((section) => (
                    <div key={section.id} className="flex items-center justify-between p-4 border rounded-lg gap-4 bg-white" data-testid={`section-item-${section.id}`}>
                      <div className="flex items-center gap-3 flex-1">
                        <GripVertical className="h-4 w-4 text-slate-300" />
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
                                This will permanently delete "{section.title}" and all its draft content. This action cannot be undone.
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

        {/* Default Justice Lenses */}
        <Card className="paper-card">
          <CardHeader>
            <CardTitle className="text-xl font-serif">Default Justice Lenses</CardTitle>
            <CardDescription>These are the built-in ethical lenses that members can apply to their report drafts.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lenses?.filter(l => ['who_benefits', 'who_is_harmed', 'labor', 'power'].includes(l.slug))
                .sort((a,b) => a.orderIndex - b.orderIndex)
                .map((lens) => (
                <div key={lens.id} className="flex items-center justify-between p-4 border rounded-lg gap-4 bg-white" data-testid={`default-lens-${lens.id}`}>
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
                      data-testid={`button-edit-default-lens-${lens.id}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {lenses?.filter(l => ['who_benefits', 'who_is_harmed', 'labor', 'power'].includes(l.slug)).length === 0 && (
                <p className="text-sm text-muted-foreground italic">Default lenses will be created when the system starts.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Custom Justice Lenses */}
        <Card className="paper-card">
          <CardHeader>
            <CardTitle className="text-xl font-serif">Custom Lenses</CardTitle>
            <CardDescription>Create additional ethical lenses for your cohort's specific needs.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <form onSubmit={handleCreateLens} className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border rounded-lg bg-slate-50/50">
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><Scale className="h-4 w-4" /> Lens Label</Label>
                <Input 
                  placeholder="e.g. Environmental Impact" 
                  value={newLens.label}
                  onChange={(e) => setNewLens({ ...newLens, label: e.target.value })}
                  required
                  data-testid="input-lens-label"
                />
              </div>
              <div className="space-y-2">
                <Label>Slug (ID)</Label>
                <Input 
                  placeholder="e.g. environmental" 
                  value={newLens.slug}
                  onChange={(e) => setNewLens({ ...newLens, slug: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                  required
                  data-testid="input-lens-slug"
                />
              </div>
              <Button type="submit" className="md:col-span-2 mt-2" disabled={isCreatingLens} data-testid="button-add-lens">
                <Plus className="mr-2 h-4 w-4" /> Add Custom Lens
              </Button>
            </form>

            <div className="space-y-4">
              <h3 className="font-serif text-lg font-bold">Your Custom Lenses</h3>
              <div className="space-y-2">
                {lenses?.filter(l => !['who_benefits', 'who_is_harmed', 'labor', 'power'].includes(l.slug)).length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">No custom lenses created yet. Use the form above to add your own.</p>
                ) : (
                  lenses?.filter(l => !['who_benefits', 'who_is_harmed', 'labor', 'power'].includes(l.slug))
                    .sort((a,b) => a.orderIndex - b.orderIndex)
                    .map((lens) => (
                    <div key={lens.id} className="flex items-center justify-between p-4 border rounded-lg gap-4 bg-white" data-testid={`lens-item-${lens.id}`}>
                      <div className="flex items-center gap-3 flex-1">
                        <GripVertical className="h-4 w-4 text-slate-300" />
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
                              <AlertDialogTitle>Delete Lens?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete the "{lens.label}" lens. This action cannot be undone.
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

        {/* Edit Lens Dialog */}
        <Dialog open={!!editingLens} onOpenChange={(open) => !open && setEditingLens(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Justice Lens</DialogTitle>
              <DialogDescription>Update the label and identifier for this lens.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Label (displayed to users)</Label>
                <Input 
                  value={editLensForm.label}
                  onChange={(e) => setEditLensForm({ ...editLensForm, label: e.target.value })}
                  placeholder="e.g. Who benefits?"
                  data-testid="input-edit-lens-label"
                />
              </div>
              <div className="space-y-2">
                <Label>Slug (unique identifier)</Label>
                <Input 
                  value={editLensForm.slug}
                  onChange={(e) => setEditLensForm({ ...editLensForm, slug: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                  placeholder="e.g. who_benefits"
                  data-testid="input-edit-lens-slug"
                />
                <p className="text-xs text-muted-foreground">Used internally to identify this lens. Use lowercase letters and underscores.</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingLens(null)}>Cancel</Button>
              <Button onClick={handleSaveLens} data-testid="button-save-lens">Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Security & Access */}
        <Card className="paper-card">
          <CardHeader>
            <CardTitle className="text-xl font-serif">Security & Access</CardTitle>
            <CardDescription>Manage how users access the platform.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Magic Invite Code</Label>
              <Input 
                 defaultValue={getSetting("magic_code")}
                 onBlur={(e) => handleUpdate("magic_code", e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-2">Share this code with new members to allow registration.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}

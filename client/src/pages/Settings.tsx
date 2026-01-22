import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { useSettings, useUpdateSetting } from "@/hooks/use-settings";
import { useMeetings, useCreateMeeting, useUpdateMeeting } from "@/hooks/use-meetings";
import { useReportSections, useCreateSection, useUpdateSection, useDeleteSection, useJusticeLenses, useCreateJusticeLens, useUpdateJusticeLens, useDeleteJusticeLens } from "@/hooks/use-report";
import { useUsers, useUpdateUserRole, useUpdateUserPassword } from "@/hooks/use-users";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { Plus, ExternalLink, Calendar, Video, Clock, FileText, Trash2, Pencil, ChevronUp, ChevronDown, BookOpen, Scale, Users, Shield, Key, Bot, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { JusticeLens, User } from "@shared/schema";

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
  const { data: allUsers, isLoading: usersLoading } = useUsers();
  const { mutate: updateRole, isPending: isUpdatingRole } = useUpdateUserRole();
  const { mutate: updatePassword, isPending: isUpdatingPassword } = useUpdateUserPassword();
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
  const [editLensForm, setEditLensForm] = useState({ label: "", slug: "", indices: "" });
  const [resetPasswordUser, setResetPasswordUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [toggleAdminUser, setToggleAdminUser] = useState<User | null>(null);

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

  const handleCreateMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMeeting.title || !newMeeting.date) return;
    createMeeting({
      ...newMeeting,
      date: new Date(newMeeting.date),
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

  const handleMoveSection = (sectionId: number, direction: 'up' | 'down') => {
    if (!sections) return;
    const sortedSections = [...sections].sort((a, b) => a.orderIndex - b.orderIndex);
    const currentIndex = sortedSections.findIndex(s => s.id === sectionId);
    if (currentIndex === -1) return;
    
    const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (swapIndex < 0 || swapIndex >= sortedSections.length) return;
    
    const currentSection = sortedSections[currentIndex];
    const swapSection = sortedSections[swapIndex];
    
    // Swap order indices
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
    setEditLensForm({ 
      label: lens.label, 
      slug: lens.slug, 
      indices: lens.indices?.join(", ") || "" 
    });
  };

  const handleSaveLens = () => {
    if (!editingLens || !editLensForm.label || !editLensForm.slug) return;
    const indicesArray = editLensForm.indices
      .split(",")
      .map(s => s.trim())
      .filter(s => s.length > 0);
    updateLens({ 
      id: editingLens.id, 
      data: { 
        label: editLensForm.label, 
        slug: editLensForm.slug,
        orderIndex: editingLens.orderIndex,
        indices: indicesArray.length > 0 ? indicesArray : null
      } 
    }, {
      onSuccess: () => {
        setEditingLens(null);
      }
    });
  };

  const handleResetPassword = () => {
    if (!resetPasswordUser || newPassword.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    updatePassword({ id: resetPasswordUser.id, password: newPassword }, {
      onSuccess: () => {
        setResetPasswordUser(null);
        setNewPassword("");
      }
    });
  };

  const handleConfirmToggleAdmin = () => {
    if (!toggleAdminUser) return;
    updateRole({ id: toggleAdminUser.id, isAdmin: !toggleAdminUser.isAdmin }, {
      onSuccess: () => setToggleAdminUser(null)
    });
  };

  if (settingsLoading || meetingsLoading || sectionsLoading || lensesLoading || usersLoading) return <PageLayout title="Settings">Loading...</PageLayout>;

  return (
    <PageLayout title="Admin Settings" description="Configure global application parameters.">
      <Tabs defaultValue="cohort" className="w-full max-w-4xl">
        <TabsList className="mb-6 flex flex-wrap h-auto gap-1" data-testid="settings-tabs">
          <TabsTrigger value="cohort" data-testid="tab-cohort">Cohort</TabsTrigger>
          <TabsTrigger value="meetings" data-testid="tab-meetings">Meetings</TabsTrigger>
          <TabsTrigger value="report" data-testid="tab-report">Report Sections</TabsTrigger>
          <TabsTrigger value="lenses" data-testid="tab-lenses">Justice Lenses</TabsTrigger>
          <TabsTrigger value="members" data-testid="tab-members">Members</TabsTrigger>
          <TabsTrigger value="security" data-testid="tab-security">Security</TabsTrigger>
          <TabsTrigger value="ai" data-testid="tab-ai">AI Tools</TabsTrigger>
        </TabsList>

        <TabsContent value="cohort" className="space-y-8 pb-12">
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
            <div className="space-y-2 pt-4 border-t">
              <Label>Inquiry Focus</Label>
              <Input 
                placeholder="e.g., Artificial Intelligence, Climate Change, Sustainable Development"
                defaultValue={getSetting("inquiry_focus")}
                onBlur={(e) => handleUpdate("inquiry_focus", e.target.value)}
                data-testid="input-inquiry-focus"
              />
              <p className="text-xs text-muted-foreground">
                The central focus of this cohort's inquiry. This will be explicitly referenced in AI synthesis.
              </p>
            </div>
          </CardContent>
        </Card>
        </TabsContent>

        <TabsContent value="meetings" className="space-y-8 pb-12">
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
        </TabsContent>

        <TabsContent value="report" className="space-y-8 pb-12">
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
        </TabsContent>

        <TabsContent value="lenses" className="space-y-8 pb-12">
        {/* Default Justice Lenses */}
        <Card className="paper-card">
          <CardHeader>
            <CardTitle className="text-xl font-serif">Default Justice Lenses</CardTitle>
            <CardDescription>These are the built-in ethical lenses that members can apply to their report drafts. Click to expand and see indices.</CardDescription>
          </CardHeader>
          <CardContent>
            {lenses?.filter(l => ['who_benefits', 'who_is_harmed', 'labor', 'power'].includes(l.slug)).length === 0 ? (
              <p className="text-sm text-muted-foreground italic">Default lenses will be created when the system starts.</p>
            ) : (
              <Accordion type="multiple" className="space-y-2">
                {lenses?.filter(l => ['who_benefits', 'who_is_harmed', 'labor', 'power'].includes(l.slug))
                  .sort((a,b) => a.orderIndex - b.orderIndex)
                  .map((lens) => (
                  <AccordionItem key={lens.id} value={`default-lens-${lens.id}`} className="border rounded-lg bg-white" data-testid={`default-lens-${lens.id}`}>
                    <div className="flex items-center justify-between pr-4">
                      <AccordionTrigger className="flex-1 px-4 py-3 hover:no-underline">
                        <div className="flex items-center gap-3">
                          <Scale className="h-4 w-4 text-primary" />
                          <div className="text-left">
                            <p className="font-medium text-slate-900">{lens.label}</p>
                            <p className="text-xs text-muted-foreground">{lens.slug} {lens.indices?.length ? `• ${lens.indices.length} indices` : ''}</p>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={(e) => { e.stopPropagation(); openEditLensDialog(lens); }}
                        data-testid={`button-edit-default-lens-${lens.id}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                    <AccordionContent className="px-4 pb-4">
                      {lens.indices && lens.indices.length > 0 ? (
                        <div className="space-y-2 pl-7">
                          {lens.indices.map((indexItem, i) => (
                            <div key={i} className="flex items-center gap-2 p-2 bg-slate-50 rounded text-sm">
                              <span className="w-2 h-2 rounded-full bg-primary/30" />
                              <span>{indexItem}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground italic pl-7">No indices defined for this lens.</p>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
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
              {lenses?.filter(l => !['who_benefits', 'who_is_harmed', 'labor', 'power'].includes(l.slug)).length === 0 ? (
                <p className="text-sm text-muted-foreground italic">No custom lenses created yet. Use the form above to add your own.</p>
              ) : (
                <Accordion type="multiple" className="space-y-2">
                  {lenses?.filter(l => !['who_benefits', 'who_is_harmed', 'labor', 'power'].includes(l.slug))
                    .sort((a,b) => a.orderIndex - b.orderIndex)
                    .map((lens) => (
                    <AccordionItem key={lens.id} value={`custom-lens-${lens.id}`} className="border rounded-lg bg-white" data-testid={`lens-item-${lens.id}`}>
                      <div className="flex items-center justify-between pr-4">
                        <AccordionTrigger className="flex-1 px-4 py-3 hover:no-underline">
                          <div className="flex items-center gap-3">
                            <Scale className="h-4 w-4 text-primary" />
                            <div className="text-left">
                              <p className="font-medium text-slate-900">{lens.label}</p>
                              <p className="text-xs text-muted-foreground">{lens.slug} {lens.indices?.length ? `• ${lens.indices.length} indices` : ''}</p>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <div className="flex items-center gap-1">
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            onClick={(e) => { e.stopPropagation(); openEditLensDialog(lens); }}
                            data-testid={`button-edit-lens-${lens.id}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" onClick={(e) => e.stopPropagation()} data-testid={`button-delete-lens-${lens.id}`}>
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
                      <AccordionContent className="px-4 pb-4">
                        {lens.indices && lens.indices.length > 0 ? (
                          <div className="space-y-2 pl-7">
                            {lens.indices.map((indexItem, i) => (
                              <div key={i} className="flex items-center gap-2 p-2 bg-slate-50 rounded text-sm">
                                <span className="w-2 h-2 rounded-full bg-primary/30" />
                                <span>{indexItem}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground italic pl-7">No indices defined for this lens.</p>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
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
              <div className="space-y-2">
                <Label>Indices (comma-separated)</Label>
                <Input 
                  value={editLensForm.indices}
                  onChange={(e) => setEditLensForm({ ...editLensForm, indices: e.target.value })}
                  placeholder="e.g. Land, Water, Energy, Materials"
                  data-testid="input-edit-lens-indices"
                />
                <p className="text-xs text-muted-foreground">Enter index items separated by commas. These are sub-topics for this lens.</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingLens(null)}>Cancel</Button>
              <Button onClick={handleSaveLens} data-testid="button-save-lens">Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </TabsContent>

        <TabsContent value="security" className="space-y-8 pb-12">
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
        </TabsContent>

        <TabsContent value="members" className="space-y-8 pb-12">
        {/* Cohort Members */}
        <Card className="paper-card">
          <CardHeader>
            <CardTitle className="text-xl font-serif flex items-center gap-2">
              <Users className="h-5 w-5" /> Cohort Members
            </CardTitle>
            <CardDescription>View and manage all registered users.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {allUsers?.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">No members have registered yet.</p>
              ) : (
                allUsers?.map((user) => (
                  <div key={user.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg gap-4 bg-white" data-testid={`user-item-${user.id}`}>
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-slate-900">{user.fullName || user.username}</p>
                          {user.isAdmin && (
                            <Badge variant="secondary" className="flex items-center gap-1" data-testid={`badge-admin-${user.id}`}>
                              <Shield className="h-3 w-3" /> Admin
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">@{user.username}</p>
                        {user.createdAt && (
                          <p className="text-xs text-muted-foreground">
                            Joined {format(new Date(user.createdAt), "MMM d, yyyy")}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Don't show Remove Admin for the system admin account */}
                      {!(user.username === 'admin' && user.isAdmin) && (
                        <Button 
                          size="sm" 
                          variant={user.isAdmin ? "outline" : "secondary"}
                          onClick={() => setToggleAdminUser(user)}
                          disabled={isUpdatingRole}
                          data-testid={`button-toggle-admin-${user.id}`}
                        >
                          <Shield className="h-4 w-4 mr-1" />
                          {user.isAdmin ? "Remove Admin" : "Make Admin"}
                        </Button>
                      )}
                      {user.username === 'admin' && user.isAdmin && (
                        <Badge variant="outline" className="text-muted-foreground">System Admin</Badge>
                      )}
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setResetPasswordUser(user)}
                        data-testid={`button-reset-password-${user.id}`}
                      >
                        <Key className="h-4 w-4 mr-1" /> Reset Password
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
        </TabsContent>

        <TabsContent value="ai" className="space-y-8 pb-12">
        {/* AI Tools */}
        <Card className="paper-card">
          <CardHeader>
            <CardTitle className="text-xl font-serif flex items-center gap-2">
              <Bot className="h-5 w-5" /> AI Tools
            </CardTitle>
            <CardDescription>Manage AI features for the cohort.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Reindex Content for AI</p>
                <p className="text-sm text-muted-foreground">
                  Index all existing posts and reflections so the AI can analyze them. 
                  Run this after importing existing data.
                </p>
              </div>
              <Button 
                onClick={() => reindexMutation.mutate()}
                disabled={reindexMutation.isPending}
                data-testid="button-reindex-ai"
              >
                {reindexMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Indexing...
                  </>
                ) : (
                  <>
                    <Bot className="h-4 w-4 mr-2" />
                    Reindex Now
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
        </TabsContent>
      </Tabs>

        {/* Reset Password Dialog */}
        <Dialog open={!!resetPasswordUser} onOpenChange={(open) => { if (!open) { setResetPasswordUser(null); setNewPassword(""); } }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reset Password</DialogTitle>
              <DialogDescription>
                You are about to reset the password for <strong>{resetPasswordUser?.fullName || resetPasswordUser?.username}</strong>. This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>New Password</Label>
                <Input 
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min 6 characters)"
                  data-testid="input-new-password"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setResetPasswordUser(null); setNewPassword(""); }}>Cancel</Button>
              <Button onClick={handleResetPassword} disabled={isUpdatingPassword || newPassword.length < 6} data-testid="button-confirm-reset-password">
                Reset Password
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Toggle Admin Confirmation Dialog */}
        <Dialog open={!!toggleAdminUser} onOpenChange={(open) => { if (!open) setToggleAdminUser(null); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {toggleAdminUser?.isAdmin ? "Remove Admin Privileges" : "Grant Admin Privileges"}
              </DialogTitle>
              <DialogDescription>
                {toggleAdminUser?.isAdmin 
                  ? <>Are you sure you want to remove admin privileges from <strong>{toggleAdminUser?.fullName || toggleAdminUser?.username}</strong>? They will no longer be able to access admin settings.</>
                  : <>Are you sure you want to make <strong>{toggleAdminUser?.fullName || toggleAdminUser?.username}</strong> an admin? They will have full access to all settings and user management.</>
                }
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setToggleAdminUser(null)}>Cancel</Button>
              <Button 
                onClick={handleConfirmToggleAdmin} 
                disabled={isUpdatingRole}
                variant={toggleAdminUser?.isAdmin ? "destructive" : "default"}
                data-testid="button-confirm-toggle-admin"
              >
                {toggleAdminUser?.isAdmin ? "Remove Admin" : "Make Admin"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    </PageLayout>
  );
}

import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { useSettings, useUpdateSetting } from "@/hooks/use-settings";
import { useMeetings, useCreateMeeting, useUpdateMeeting } from "@/hooks/use-meetings";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Plus, ExternalLink, Calendar, Video, Clock, FileText } from "lucide-react";
import { format } from "date-fns";

export default function Settings() {
  const { data: settings, isLoading: settingsLoading } = useSettings();
  const { mutate: updateSetting } = useUpdateSetting();
  const { data: meetings, isLoading: meetingsLoading } = useMeetings();
  const { mutate: createMeeting } = useCreateMeeting();
  const { mutate: updateMeeting } = useUpdateMeeting();
  const { toast } = useToast();

  const [newMeeting, setNewMeeting] = useState({
    title: "",
    date: "",
    zoomLink: "",
    agenda: ""
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
      date: new Date(newMeeting.date).toISOString(),
    }, {
      onSuccess: () => {
        setNewMeeting({ title: "", date: "", zoomLink: "", agenda: "" });
      }
    });
  };

  if (settingsLoading || meetingsLoading) return <PageLayout title="Settings">Loading...</PageLayout>;

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

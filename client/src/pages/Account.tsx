import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { useUser } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  User, Key, Shield, Calendar, Lightbulb, Sparkles, Brain, Heart, HelpCircle,
  BookOpen, LayoutDashboard, Search, Users, FileText, MessageSquare, Eye, Tag, Plus, CheckCircle, Bot
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useAiSettings, useUpdateAiSettings } from "@/hooks/use-ai";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function Account() {
  const { user } = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [showUsernameDialog, setShowUsernameDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // AI Settings
  const { data: aiSettings, isLoading: isLoadingAiSettings } = useAiSettings();
  const { mutate: updateAiSettings, isPending: isUpdatingAiSettings } = useUpdateAiSettings();

  const updateUsernameMutation = useMutation({
    mutationFn: async (username: string) => {
      const res = await fetch("/api/account/username", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to update username");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({ title: "Username updated successfully" });
      setShowUsernameDialog(false);
      setNewUsername("");
    },
    onError: (error: Error) => {
      toast({ title: error.message, variant: "destructive" });
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: async ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) => {
      const res = await fetch("/api/account/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to update password");
      }
      return await res.json();
    },
    onSuccess: () => {
      toast({ title: "Password updated successfully" });
      setShowPasswordDialog(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (error: Error) => {
      toast({ title: error.message, variant: "destructive" });
    },
  });

  const handleUpdateUsername = () => {
    if (newUsername.length < 3) {
      toast({ title: "Username must be at least 3 characters", variant: "destructive" });
      return;
    }
    updateUsernameMutation.mutate(newUsername);
  };

  const handleUpdatePassword = () => {
    if (newPassword.length < 6) {
      toast({ title: "New password must be at least 6 characters", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }
    updatePasswordMutation.mutate({ currentPassword, newPassword });
  };

  if (!user) return <PageLayout title="Account">Loading...</PageLayout>;

  return (
    <PageLayout title="My Account" description="Manage your personal account settings.">
      <div className="max-w-2xl space-y-6">
        {/* Getting Started Guide */}
        <Card className="paper-card">
          <CardHeader>
            <CardTitle className="text-xl font-serif flex items-center gap-2">
              <BookOpen className="h-5 w-5" /> How to Use This App
            </CardTitle>
            <CardDescription>A complete guide to help you get the most out of the Inquiry Hub platform.</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="overview">
                <AccordionTrigger className="text-left">
                  <div className="flex items-center gap-2">
                    <LayoutDashboard className="h-4 w-4 text-primary" />
                    <span>Dashboard Overview</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground space-y-2 pl-6">
                  <p>The <strong>Dashboard</strong> is your home base. Here you'll find:</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li><strong>Cohort Timeline</strong> - See important dates and milestones from January to July 2026</li>
                    <li><strong>Upcoming Meetings</strong> - Quick view of your next scheduled cohort meetings</li>
                    <li><strong>Quick Actions</strong> - Fast links to common tasks like adding reflections or resources</li>
                    <li><strong>Recent Activity</strong> - See what your cohort members have been working on</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="inquiries">
                <AccordionTrigger className="text-left">
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-primary" />
                    <span>My Inquiries - Tracking Your Research</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground space-y-2 pl-6">
                  <p>The <strong>My Inquiries</strong> page is your personal research journal:</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li><strong>Inquiry Questions</strong> - Document the research questions you're exploring</li>
                    <li><strong>Learning Pathway</strong> - Track books, articles, tools, and resources you're studying</li>
                    <li><strong>Weekly Reflections</strong> - Write brief reflections on your learning each week</li>
                    <li><strong>Progress Tracking</strong> - See how your inquiry evolves over time</li>
                  </ul>
                  <p className="pt-2">Tip: Regular weekly reflections help you synthesize your learning and prepare for the final report.</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="resources">
                <AccordionTrigger className="text-left">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-primary" />
                    <span>Shared Resources - Collaborative Library</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground space-y-2 pl-6">
                  <p>The <strong>Resources</strong> page is a shared library for your cohort:</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li><strong>Add Resources</strong> - Share articles, tools, videos, or any helpful links</li>
                    <li><strong>Add Tags</strong> - Categorize resources so others can find them easily</li>
                    <li><strong>Add Notes</strong> - Include your thoughts on why this resource is valuable</li>
                    <li><strong>Browse & Search</strong> - Find resources shared by other cohort members</li>
                  </ul>
                  <p className="pt-2">Tip: When you find something useful, share it! Your cohort members will appreciate it.</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="meetings">
                <AccordionTrigger className="text-left">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    <span>Meetings - Cohort Gatherings</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground space-y-2 pl-6">
                  <p>The <strong>Meetings</strong> page helps you stay organized:</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li><strong>View Schedule</strong> - See all upcoming and past meetings</li>
                    <li><strong>Meeting Details</strong> - Access agendas, Zoom links, and notes</li>
                    <li><strong>Meeting Notes</strong> - Review or add notes from each session</li>
                    <li><strong>Action Items</strong> - Track tasks assigned during meetings</li>
                  </ul>
                  <p className="pt-2">Administrators can create and edit meetings. Members can view and add notes.</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="report">
                <AccordionTrigger className="text-left">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <span>Report Builder - Collaborative Writing</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground space-y-2 pl-6">
                  <p>The <strong>Report Builder</strong> is where your cohort collaboratively writes the final report:</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li><strong>8 Sections</strong> - From Introduction to References, each section can have multiple contributions</li>
                    <li><strong>Post Contributions</strong> - Click "Add your contribution" to add your thoughts to any section</li>
                    <li><strong>Justice Lens Tags</strong> - When posting, select relevant justice/ethics lenses to tag your contribution</li>
                    <li><strong>Section Discussion</strong> - Use the chat sidebar to discuss the section with your cohort</li>
                  </ul>
                  <p className="pt-2 font-medium">Engagement Features:</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li><Eye className="h-3 w-3 inline mr-1" /><strong>Read Tracking</strong> - Posts show how many people have read them (e.g., "3/5")</li>
                    <li><strong>New Badge</strong> - Unread posts are highlighted with a "New" badge</li>
                    <li><strong>Reactions</strong> - React to posts with Insightful, Well Written, Makes Me Think, or Love This</li>
                    <li><strong>Unread Counts</strong> - Section tabs show how many new posts you haven't read</li>
                    <li><Bot className="h-3 w-3 inline mr-1" /><strong>AI Synthesis</strong> - Click "AI Synthesis" to get an AI-generated summary of all contributions in a section</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="ai-insights">
                <AccordionTrigger className="text-left">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span>AI Insights - Smart Summaries</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground space-y-2 pl-6">
                  <p>The <strong>AI Insights</strong> page helps you synthesize your learning journey:</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li><strong>My Journey Summary</strong> - Generate an AI summary of your inquiries, reflections, and contributions</li>
                    <li><strong>Key Themes</strong> - See patterns and themes across your work</li>
                    <li><strong>Notable Quotes</strong> - AI highlights important insights from your writing</li>
                    <li><strong>Open Questions</strong> - Discover questions emerging from your research</li>
                    <li><strong>Next Steps</strong> - Get AI-suggested actions to continue your inquiry</li>
                    <li><strong>Past Summaries</strong> - View previously generated summaries</li>
                  </ul>
                  <p className="pt-2 font-medium">Section Synthesis (in Report Builder):</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Click <strong>AI Synthesis</strong> on any report section to summarize all contributions</li>
                    <li>Great for identifying common themes across cohort members' posts</li>
                    <li>Helps synthesize collective thinking before writing final drafts</li>
                  </ul>
                  <p className="pt-2 font-medium">Privacy:</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Control AI access to your private reflections in Account Settings</li>
                    <li>Private content is never shared with other cohort members</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="engagement">
                <AccordionTrigger className="text-left">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    <span>Being an Active Cohort Member</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground space-y-2 pl-6">
                  <p>Here's how to be an engaged member of your inquiry cohort:</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li><strong>Read regularly</strong> - Check the Report Builder often to see new contributions</li>
                    <li><strong>React to posts</strong> - Let your cohort know when something resonates with you</li>
                    <li><strong>Share resources</strong> - Add helpful materials to the shared library</li>
                    <li><strong>Write reflections</strong> - Document your learning journey weekly</li>
                    <li><strong>Contribute to sections</strong> - Add your voice to the collaborative report</li>
                    <li><strong>Join discussions</strong> - Participate in section-level conversations</li>
                  </ul>
                  <p className="pt-2">Remember: This is a collaborative journey. Your contributions help everyone learn!</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="tips">
                <AccordionTrigger className="text-left">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span>Quick Tips for Success</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground space-y-2 pl-6">
                  <ul className="list-disc pl-4 space-y-2">
                    <li><strong>Weekly check-ins</strong> - Set aside 15-30 minutes each week to add reflections and catch up on posts</li>
                    <li><strong>Use tags</strong> - Tag your resources and posts with justice lenses to help with final report synthesis</li>
                    <li><strong>Read before posting</strong> - Check what others have written to build on their ideas</li>
                    <li><strong>Ask questions</strong> - Use the discussion sidebar to ask clarifying questions</li>
                    <li><strong>Be supportive</strong> - Use reactions to encourage your cohort members</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card className="paper-card">
          <CardHeader>
            <CardTitle className="text-xl font-serif flex items-center gap-2">
              <User className="h-5 w-5" /> Account Information
            </CardTitle>
            <CardDescription>Your personal account details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Full Name</Label>
                <p className="font-medium">{user.fullName || "Not set"}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Username</Label>
                <div className="flex items-center gap-2">
                  <p className="font-medium">@{user.username}</p>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => { setNewUsername(user.username); setShowUsernameDialog(true); }}
                    data-testid="button-change-username"
                  >
                    Change
                  </Button>
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Role</Label>
                <div className="flex items-center gap-2">
                  {user.isAdmin ? (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Shield className="h-3 w-3" /> Administrator
                    </Badge>
                  ) : (
                    <Badge variant="outline">Member</Badge>
                  )}
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Member Since</Label>
                <p className="font-medium flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  {user.createdAt ? format(new Date(user.createdAt), "MMMM d, yyyy") : "Unknown"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="paper-card">
          <CardHeader>
            <CardTitle className="text-xl font-serif flex items-center gap-2">
              <Key className="h-5 w-5" /> Security
            </CardTitle>
            <CardDescription>Manage your password and account security.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Password</p>
                <p className="text-sm text-muted-foreground">Change your account password</p>
              </div>
              <Button 
                variant="outline"
                onClick={() => setShowPasswordDialog(true)}
                data-testid="button-change-password"
              >
                <Key className="h-4 w-4 mr-2" /> Change Password
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* AI Privacy Settings */}
        <Card className="paper-card">
          <CardHeader>
            <CardTitle className="text-xl font-serif flex items-center gap-2">
              <Bot className="h-5 w-5" /> AI Privacy Settings
            </CardTitle>
            <CardDescription>Control how AI features use your content.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="font-medium">Include Private Reflections in AI Summaries</Label>
                <p className="text-sm text-muted-foreground">
                  When enabled, your private reflections will be included when generating personal AI journey summaries. 
                  Private content is never shared with other cohort members.
                </p>
              </div>
              <Switch
                checked={aiSettings?.includePrivateInAI ?? true}
                onCheckedChange={(checked) => updateAiSettings({ includePrivateInAI: checked })}
                disabled={isLoadingAiSettings || isUpdatingAiSettings}
                data-testid="switch-include-private-ai"
              />
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">
                <strong>How AI features work:</strong> The AI Insights feature analyzes your inquiry journey 
                (questions, reflections, and contributions) to provide personalized summaries and identify themes. 
                Your private reflections are only used in your personal summaries and are never visible to other members.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Reaction Guide */}
        <Card className="paper-card">
          <CardHeader>
            <CardTitle className="text-xl font-serif flex items-center gap-2">
              <HelpCircle className="h-5 w-5" /> Reaction Icons Guide
            </CardTitle>
            <CardDescription>Learn what each reaction means in the Report Builder.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <p className="font-medium">Insightful</p>
                  <p className="text-sm text-muted-foreground">This post taught me something new or offered a fresh perspective</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="font-medium">Well Written</p>
                  <p className="text-sm text-muted-foreground">Clear, articulate, and easy to understand</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <Brain className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="font-medium">Makes Me Think</p>
                  <p className="text-sm text-muted-foreground">Raises important questions or challenges my assumptions</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <Heart className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="font-medium">Love This</p>
                  <p className="text-sm text-muted-foreground">I really appreciate this contribution</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Change Username Dialog */}
        <Dialog open={showUsernameDialog} onOpenChange={setShowUsernameDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Change Username</DialogTitle>
              <DialogDescription>
                Enter a new username. This will be visible to other cohort members.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>New Username</Label>
                <Input 
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="Enter new username"
                  data-testid="input-new-username"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowUsernameDialog(false)}>Cancel</Button>
              <Button 
                onClick={handleUpdateUsername} 
                disabled={updateUsernameMutation.isPending || newUsername.length < 3}
                data-testid="button-confirm-username"
              >
                Save Username
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Change Password Dialog */}
        <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Change Password</DialogTitle>
              <DialogDescription>
                Enter your current password and choose a new one.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Current Password</Label>
                <Input 
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  data-testid="input-current-password"
                />
              </div>
              <div className="space-y-2">
                <Label>New Password</Label>
                <Input 
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min 6 characters)"
                  data-testid="input-new-password-account"
                />
              </div>
              <div className="space-y-2">
                <Label>Confirm New Password</Label>
                <Input 
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  data-testid="input-confirm-password"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowPasswordDialog(false); setCurrentPassword(""); setNewPassword(""); setConfirmPassword(""); }}>Cancel</Button>
              <Button 
                onClick={handleUpdatePassword} 
                disabled={updatePasswordMutation.isPending || !currentPassword || newPassword.length < 6 || newPassword !== confirmPassword}
                data-testid="button-confirm-password"
              >
                Update Password
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageLayout>
  );
}

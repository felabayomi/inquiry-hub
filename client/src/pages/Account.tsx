import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { useUser } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { User, Key, Shield, Calendar } from "lucide-react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
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

import { useState } from "react";
import { useLogin, useRegister } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState("login");
  const { mutate: login, isPending: isLoginPending } = useLogin();
  const { mutate: register, isPending: isRegisterPending } = useRegister();
  const [, setLocation] = useLocation();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    fullName: "",
    inviteCode: "",
  });
  const [keepMeSignedIn, setKeepMeSignedIn] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === "login") {
      login(
        { username: formData.username, password: formData.password },
        { onSuccess: () => setLocation("/") }
      );
    } else {
      register(formData, { onSuccess: () => setLocation("/") });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-serif font-bold text-slate-900 tracking-tight">Cohort Inquiry</h1>
          <p className="mt-2 text-slate-600">Collaborative research and reporting platform</p>
        </div>

        <Card className="border-slate-200 shadow-xl shadow-slate-200/50">
          <CardHeader>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>

              {activeTab === "register" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="fullname">Full Name</Label>
                    <Input
                      id="fullname"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="invite">Cohort Invite Code</Label>
                    <Input
                      id="invite"
                      value={formData.inviteCode}
                      onChange={(e) => setFormData({ ...formData, inviteCode: e.target.value })}
                      required
                      placeholder="Ask your administrator"
                    />
                  </div>
                </>
              )}

              {activeTab === "login" && (
                <div className="flex items-center space-x-2 pt-2">
                  <input
                    type="checkbox"
                    id="keep-signed-in"
                    checked={keepMeSignedIn}
                    onChange={(e) => setKeepMeSignedIn(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                  />
                  <Label htmlFor="keep-signed-in" className="text-sm font-medium text-slate-600 cursor-pointer">
                    Keep me signed in
                  </Label>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full mt-6 bg-slate-900 hover:bg-slate-800 text-white transition-all duration-300" 
                disabled={isLoginPending || isRegisterPending}
              >
                {(isLoginPending || isRegisterPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {activeTab === "login" ? "Sign In" : "Create Account"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

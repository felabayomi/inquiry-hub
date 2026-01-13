import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

type AppSettings = z.infer<typeof api.settings.list.responses[200]>;
type UpdateSetting = z.infer<typeof api.settings.update.input>;

export default function Settings() {
  const { data: settings, isLoading } = useQuery<AppSettings>({
    queryKey: [api.settings.list.path],
    queryFn: async () => {
      const res = await fetch(api.settings.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return await res.json();
    },
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { mutate: updateSetting } = useMutation({
    mutationFn: async (data: UpdateSetting) => {
      await fetch(api.settings.update.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.settings.list.path] });
      toast({ title: "Setting Updated" });
    },
  });

  const getSetting = (key: string) => settings?.find(s => s.key === key)?.value || "";

  const handleUpdate = (key: string, value: string) => {
    updateSetting({ key, value });
  };

  if (isLoading) return <PageLayout title="Settings">Loading...</PageLayout>;

  return (
    <PageLayout title="Admin Settings" description="Configure global application parameters.">
      <div className="max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Cohort Configuration</CardTitle>
            <CardDescription>Basic information for the current cohort.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Cohort Name</Label>
              <div className="flex gap-2">
                <Input 
                  defaultValue={getSetting("cohort_name")}
                  onBlur={(e) => handleUpdate("cohort_name", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security & Access</CardTitle>
            <CardDescription>Manage how users access the platform.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Magic Invite Code</Label>
              <Input 
                 defaultValue={getSetting("magic_code")}
                 onBlur={(e) => handleUpdate("magic_code", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Share this code with new members to allow registration.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}

import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { useSettings, useUpdateSetting } from "@/hooks/use-settings";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { data: settings, isLoading } = useSettings();
  const { mutate: updateSetting } = useUpdateSetting();
  const { toast } = useToast();

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

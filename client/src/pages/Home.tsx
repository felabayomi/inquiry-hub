import { PageLayout } from "@/components/layout/PageLayout";
import { useUser } from "@/hooks/use-auth";
import { useSettings } from "@/hooks/use-settings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, BookOpenCheck, Library, Sparkles, FileText } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user } = useUser();
  const { data: settings } = useSettings();

  // Calculate timeline progress
  const startSetting = settings?.find(s => s.key === 'cohort_start')?.value;
  const endSetting = settings?.find(s => s.key === 'cohort_end')?.value;

  const projectStartDate = startSetting ? new Date(startSetting) : new Date("2026-01-13");
  const projectEndDate = endSetting ? new Date(endSetting) : new Date("2026-07-01");
  const today = new Date();
  
  const totalDays = (projectEndDate.getTime() - projectStartDate.getTime()) / (1000 * 60 * 60 * 24);
  const elapsedDays = (today.getTime() - projectStartDate.getTime()) / (1000 * 60 * 60 * 24);
  const progressPercent = Math.max(0, Math.min(100, (elapsedDays / totalDays) * 100));
  const currentWeek = Math.max(1, Math.floor(elapsedDays / 7) + 1);

  return (
    <PageLayout 
      title={`Welcome, ${user?.fullName.split(' ')[0]}`}
      description="Track your research progress and insights."
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Timeline Progress */}
        <Card className="col-span-1 md:col-span-3 paper-card bg-gradient-to-br from-slate-900 to-slate-800 text-white border-none">
          <CardHeader>
            <CardTitle className="font-serif text-2xl">Research Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-slate-300">You are currently in <span className="text-white font-bold">Week {currentWeek}</span> of your research journey.</p>
              <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-secondary h-full rounded-full transition-all duration-1000" 
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-slate-400 font-mono mt-2">
                <span>Start</span>
                <span>Midpoint</span>
                <span>Complete</span>
              </div>
            </div>
            
            <div className="mt-8">
              <Link href="/report">
                <button className="bg-white text-slate-900 px-6 py-2 rounded-md font-medium text-sm hover:bg-secondary transition-colors inline-flex items-center">
                  Continue Writing <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="col-span-1 md:col-span-3 paper-card">
          <CardHeader>
            <CardTitle className="font-serif">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/inquiry">
              <div className="group p-4 rounded-lg border border-border hover:border-primary hover:bg-slate-50 transition-all cursor-pointer" data-testid="link-inquiry">
                <BookOpenCheck className="h-6 w-6 text-slate-400 group-hover:text-primary mb-3" />
                <h3 className="font-medium text-foreground">Log Reflection</h3>
                <p className="text-xs text-muted-foreground mt-1">Record your insights</p>
              </div>
            </Link>
            <Link href="/resources">
              <div className="group p-4 rounded-lg border border-border hover:border-primary hover:bg-slate-50 transition-all cursor-pointer" data-testid="link-resources">
                <Library className="h-6 w-6 text-slate-400 group-hover:text-primary mb-3" />
                <h3 className="font-medium text-foreground">Add Resource</h3>
                <p className="text-xs text-muted-foreground mt-1">Save links and notes</p>
              </div>
            </Link>
            <Link href="/report">
              <div className="group p-4 rounded-lg border border-border hover:border-primary hover:bg-slate-50 transition-all cursor-pointer" data-testid="link-report">
                <FileText className="h-6 w-6 text-slate-400 group-hover:text-primary mb-3" />
                <h3 className="font-medium text-foreground">Write Document</h3>
                <p className="text-xs text-muted-foreground mt-1">Draft your report</p>
              </div>
            </Link>
            <Link href="/ai-insights">
              <div className="group p-4 rounded-lg border border-border hover:border-primary hover:bg-slate-50 transition-all cursor-pointer" data-testid="link-ai-insights">
                <Sparkles className="h-6 w-6 text-slate-400 group-hover:text-primary mb-3" />
                <h3 className="font-medium text-foreground">AI Insights</h3>
                <p className="text-xs text-muted-foreground mt-1">Get AI-powered analysis</p>
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}

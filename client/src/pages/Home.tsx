import { PageLayout } from "@/components/layout/PageLayout";
import { useUser } from "@/hooks/use-auth";
import { useMeetings } from "@/hooks/use-meetings";
import { useSettings } from "@/hooks/use-settings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Calendar, ArrowRight, BookOpenCheck } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user } = useUser();
  const { data: meetings } = useMeetings();
  const { data: settings } = useSettings();

  // Calculate timeline progress
  const startSetting = settings?.find(s => s.key === 'cohort_start')?.value;
  const endSetting = settings?.find(s => s.key === 'cohort_end')?.value;

  const cohortStartDate = startSetting ? new Date(startSetting) : new Date("2026-01-13");
  const cohortEndDate = endSetting ? new Date(endSetting) : new Date("2026-07-01");
  const today = new Date();
  
  const totalDays = (cohortEndDate.getTime() - cohortStartDate.getTime()) / (1000 * 60 * 60 * 24);
  const elapsedDays = (today.getTime() - cohortStartDate.getTime()) / (1000 * 60 * 60 * 24);
  const progressPercent = Math.max(0, Math.min(100, (elapsedDays / totalDays) * 100));
  const currentWeek = Math.max(1, Math.floor(elapsedDays / 7) + 1);

  // Sort meetings by date and pick next 3
  const upcomingMeetings = meetings
    ?.filter(m => new Date(m.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  return (
    <PageLayout 
      title={`Welcome, ${user?.fullName.split(' ')[0]}`}
      description="Track your progress and stay connected with your cohort."
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Quick Stats / Timeline */}
        <Card className="col-span-1 md:col-span-2 paper-card bg-gradient-to-br from-slate-900 to-slate-800 text-white border-none">
          <CardHeader>
            <CardTitle className="font-serif text-2xl">Cohort Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-slate-300">You are currently in <span className="text-white font-bold">Week {currentWeek}</span> of the inquiry process.</p>
              <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-secondary h-full rounded-full transition-all duration-1000" 
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-slate-400 font-mono mt-2">
                <span>Kickoff</span>
                <span>Midpoint</span>
                <span>Final Report</span>
              </div>
            </div>
            
            <div className="mt-8">
              <Link href="/report">
                <button className="bg-white text-slate-900 px-6 py-2 rounded-md font-medium text-sm hover:bg-secondary transition-colors inline-flex items-center">
                  Continue Drafting Report <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Next Meeting */}
        <Card className="col-span-1 paper-card border-l-4 border-l-primary">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Calendar className="mr-2 h-5 w-5 text-primary" />
              Upcoming
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {upcomingMeetings && upcomingMeetings.length > 0 ? (
              upcomingMeetings.map((meeting) => (
                <div key={meeting.id} className="border-b border-border last:border-0 pb-4 last:pb-0">
                  <p className="font-bold text-foreground">{meeting.title}</p>
                  <p className="text-sm text-primary font-medium mt-1">
                    {format(new Date(meeting.date), "EEE, MMM d • h:mm a")}
                  </p>
                  {meeting.zoomLink && (
                    <a 
                      href={meeting.zoomLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline mt-2 inline-block"
                    >
                      Join Zoom Meeting
                    </a>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No upcoming meetings scheduled.</p>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="col-span-1 md:col-span-3 paper-card">
          <CardHeader>
            <CardTitle className="font-serif">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/inquiry">
              <div className="group p-4 rounded-lg border border-border hover:border-primary hover:bg-slate-50 transition-all cursor-pointer">
                <BookOpenCheck className="h-6 w-6 text-slate-400 group-hover:text-primary mb-3" />
                <h3 className="font-medium text-foreground">Log Reflection</h3>
                <p className="text-xs text-muted-foreground mt-1">Record your weekly insights</p>
              </div>
            </Link>
            {/* Add more quick actions here if needed */}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}

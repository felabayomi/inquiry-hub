import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { useMeetings, useCreateMeeting } from "@/hooks/use-meetings";
import { useUser } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { CalendarDays, Video, Plus } from "lucide-react";

export default function Meetings() {
  const { user } = useUser();
  const { data: meetings } = useMeetings();
  const { mutate: createMeeting, isPending } = useCreateMeeting();
  const [isOpen, setIsOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    date: "",
    time: "",
    agenda: "",
    zoomLink: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Combine date and time
    const dateTime = new Date(`${formData.date}T${formData.time}`);
    
    createMeeting({
      title: formData.title,
      date: dateTime.toISOString(),
      agenda: formData.agenda,
      zoomLink: formData.zoomLink,
    }, {
      onSuccess: () => {
        setIsOpen(false);
        setFormData({ title: "", date: "", time: "", agenda: "", zoomLink: "" });
      }
    });
  };

  const isAdmin = user?.role === "admin";

  return (
    <PageLayout 
      title="Cohort Meetings" 
      description="Schedule and agenda for our synchronous sessions."
      action={
        isAdmin && (
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Schedule Meeting
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Schedule New Meeting</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input 
                    value={formData.title} 
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    required 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input 
                      type="date"
                      value={formData.date} 
                      onChange={e => setFormData({...formData, date: e.target.value})}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Time</Label>
                    <Input 
                      type="time"
                      value={formData.time} 
                      onChange={e => setFormData({...formData, time: e.target.value})}
                      required 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Zoom Link (Optional)</Label>
                  <Input 
                    value={formData.zoomLink} 
                    onChange={e => setFormData({...formData, zoomLink: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Agenda</Label>
                  <Textarea 
                    value={formData.agenda} 
                    onChange={e => setFormData({...formData, agenda: e.target.value})}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending ? "Creating..." : "Schedule Meeting"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )
      }
    >
      <div className="relative border-l-2 border-slate-200 ml-4 space-y-12 pb-12">
        {meetings?.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .map((meeting) => {
            const date = new Date(meeting.date);
            const isPast = date < new Date();
            
            return (
              <div key={meeting.id} className="relative pl-8">
                {/* Timeline Dot */}
                <div className={`absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-white shadow-sm ${isPast ? 'bg-slate-300' : 'bg-primary'}`} />
                
                <Card className={`paper-card ${isPast ? 'opacity-70 bg-slate-50' : 'border-l-4 border-l-primary'}`}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl font-serif">{meeting.title}</CardTitle>
                        <div className="flex items-center text-sm text-muted-foreground mt-2 space-x-4">
                          <span className="flex items-center">
                            <CalendarDays className="mr-1 h-4 w-4" />
                            {format(date, "EEEE, MMMM do, yyyy")}
                          </span>
                          <span className="font-mono bg-slate-100 px-2 rounded">
                            {format(date, "h:mm a")}
                          </span>
                        </div>
                      </div>
                      
                      {meeting.zoomLink && !isPast && (
                        <a 
                          href={meeting.zoomLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center text-sm bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors"
                        >
                          <Video className="h-3.5 w-3.5 mr-2" />
                          Join Zoom
                        </a>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">Agenda</h4>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">
                      {meeting.agenda || "No agenda details available."}
                    </p>
                  </CardContent>
                </Card>
              </div>
            );
        })}
      </div>
    </PageLayout>
  );
}

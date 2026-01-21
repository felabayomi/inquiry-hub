import { PageLayout } from "@/components/layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, BookOpen, Calendar, FileText, Brain, Shield, 
  Target, Lightbulb, Heart, Globe 
} from "lucide-react";

export default function About() {
  return (
    <PageLayout title="About Inquiry Hub">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Our Mission
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Inquiry Hub is a collaborative platform designed to support cohort-based research and learning journeys. 
              We believe that meaningful inquiry happens best when people work together, share resources, and build 
              on each other's insights.
            </p>
            <p className="text-muted-foreground">
              Our platform provides the tools and structure needed for small groups to track their individual 
              research inquiries, collaborate on shared resources, manage meetings, and ultimately produce 
              comprehensive reports that reflect their collective learning.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              Key Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex gap-3">
                <BookOpen className="h-5 w-5 text-blue-500 mt-1 shrink-0" />
                <div>
                  <h4 className="font-medium">Personal Inquiry Tracking</h4>
                  <p className="text-sm text-muted-foreground">
                    Document your research questions, learning pathways, and weekly reflections
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Globe className="h-5 w-5 text-green-500 mt-1 shrink-0" />
                <div>
                  <h4 className="font-medium">Shared Resource Library</h4>
                  <p className="text-sm text-muted-foreground">
                    Collaboratively collect and annotate articles, tools, and references
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Calendar className="h-5 w-5 text-purple-500 mt-1 shrink-0" />
                <div>
                  <h4 className="font-medium">Meeting Management</h4>
                  <p className="text-sm text-muted-foreground">
                    Schedule meetings, track agendas, notes, and action items
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <FileText className="h-5 w-5 text-orange-500 mt-1 shrink-0" />
                <div>
                  <h4 className="font-medium">Report Builder</h4>
                  <p className="text-sm text-muted-foreground">
                    Collaboratively draft structured reports with version history
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Brain className="h-5 w-5 text-pink-500 mt-1 shrink-0" />
                <div>
                  <h4 className="font-medium">AI-Powered Insights</h4>
                  <p className="text-sm text-muted-foreground">
                    Get synthesized summaries and evidence-backed analysis of your work
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Shield className="h-5 w-5 text-slate-500 mt-1 shrink-0" />
                <div>
                  <h4 className="font-medium">Privacy Controls</h4>
                  <p className="text-sm text-muted-foreground">
                    Choose who can see your content: private, group, or entire cohort
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              Who It's For
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Inquiry Hub is designed for cohort-based learning environments where small groups (typically 4-5 members 
              plus facilitators) work together on research projects over an extended period.
            </p>
            <p className="text-muted-foreground">
              Whether you're part of a doctoral program, professional development cohort, research team, 
              or any collaborative learning community, Inquiry Hub provides the structure and tools to 
              support your journey from initial questions to final deliverables.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              Our Values
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex gap-2">
                <span className="font-medium text-foreground">Collaboration:</span>
                Learning is enhanced when we share ideas and build on each other's insights
              </li>
              <li className="flex gap-2">
                <span className="font-medium text-foreground">Reflection:</span>
                Regular reflection deepens understanding and reveals patterns in our thinking
              </li>
              <li className="flex gap-2">
                <span className="font-medium text-foreground">Justice & Ethics:</span>
                We encourage examining issues through multiple lenses including equity and ethics
              </li>
              <li className="flex gap-2">
                <span className="font-medium text-foreground">Privacy:</span>
                You control who sees your work as you develop your ideas
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}

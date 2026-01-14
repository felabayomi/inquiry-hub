import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { useMyInquiry, useUpsertInquiry, useCreateReflection, useDeleteReflection } from "@/hooks/use-inquiries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { PenLine, Save, Trash2 } from "lucide-react";

export default function Inquiry() {
  const { data: inquiry, isLoading } = useMyInquiry();
  const { mutate: saveInquiry, isPending: isSaving } = useUpsertInquiry();
  const { mutate: addReflection, isPending: isAddingReflection } = useCreateReflection();
  const { mutate: deleteReflection } = useDeleteReflection();

  const [question, setQuestion] = useState("");
  const [pathway, setPathway] = useState("");
  const [newReflection, setNewReflection] = useState("");
  
  // Initialize form state when data loads
  if (inquiry && question === "" && pathway === "") {
    setQuestion(inquiry.question);
    setPathway(inquiry.pathway);
  }

  const handleSaveInquiry = () => {
    saveInquiry({ question, pathway });
  };

  const handleAddReflection = () => {
    if (!inquiry) return;
    addReflection({
      inquiryId: inquiry.id,
      content: newReflection,
      weekOf: new Date().toISOString(),
    });
    setNewReflection("");
  };

  if (isLoading) {
    return (
      <PageLayout title="My Inquiry">
        <div className="space-y-6">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout 
      title="My Inquiry" 
      description="Define your research question and track your learning journey."
    >
      <div className="grid gap-8">
        {/* Top Section: Question & Pathway */}
        <Card className="paper-card border-t-4 border-t-accent">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-serif text-xl">Core Inquiry</CardTitle>
            <Button 
              onClick={handleSaveInquiry} 
              disabled={isSaving}
              variant="outline"
              size="sm"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="question" className="text-base font-medium">Research Question</Label>
              <Input
                id="question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="What is the core question you are exploring?"
                className="font-serif text-lg py-6"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pathway" className="text-base font-medium">Learning Pathway</Label>
              <Textarea
                id="pathway"
                value={pathway}
                onChange={(e) => setPathway(e.target.value)}
                placeholder="List books, courses, or experiences you plan to engage with..."
                className="h-24 resize-none"
              />
            </div>
          </CardContent>
        </Card>

        {/* Bottom Section: Reflections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* List of Reflections */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-serif font-bold">Reflections Journal</h2>
            {inquiry?.reflections && inquiry.reflections.length > 0 ? (
              inquiry.reflections.map((ref) => (
                <Card key={ref.id} className="paper-card hover:shadow-md transition-shadow group">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground font-mono bg-slate-100 px-2 py-1 rounded">
                        Week of {format(new Date(ref.weekOf), "MMM d")}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                        onClick={() => {
                          if (confirm("Delete this reflection?")) {
                            deleteReflection(ref.id);
                          }
                        }}
                        data-testid={`button-delete-reflection-${ref.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap text-foreground/90 leading-relaxed">{ref.content}</p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                <p className="text-muted-foreground">No reflections yet. Start your journey today.</p>
              </div>
            )}
          </div>

          {/* Add New Reflection */}
          <div>
            <Card className="sticky top-24 paper-card bg-secondary/20 border-secondary">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <PenLine className="h-5 w-5 mr-2" />
                  New Entry
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={newReflection}
                  onChange={(e) => setNewReflection(e.target.value)}
                  placeholder="What did you learn this week? How has your thinking evolved?"
                  className="h-48 resize-none bg-white"
                />
                <Button 
                  onClick={handleAddReflection} 
                  disabled={!inquiry || isAddingReflection || !newReflection.trim()}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {isAddingReflection ? "Posting..." : "Post Reflection"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

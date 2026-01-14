import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { useAllInquiries, useAddInquiryComment } from "@/hooks/use-inquiries";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { format } from "date-fns";
import { MessageSquare, User as UserIcon, BookOpen, Send, Calendar } from "lucide-react";
import type { Inquiry, Reflection, InquiryComment, User } from "@shared/schema";

type InquiryWithDetails = Inquiry & { 
  user: User; 
  reflections: Reflection[];
  comments: (InquiryComment & { user: User })[];
};

export default function CohortOverview() {
  const { data: inquiries, isLoading } = useAllInquiries() as { data: InquiryWithDetails[] | undefined, isLoading: boolean };
  const { mutate: addComment, isPending } = useAddInquiryComment();
  const [commentText, setCommentText] = useState<Record<number, string>>({});

  const handleAddComment = (inquiryId: number) => {
    const content = commentText[inquiryId];
    if (!content?.trim()) return;
    addComment({ inquiryId, content }, {
      onSuccess: () => {
        setCommentText(prev => ({ ...prev, [inquiryId]: "" }));
      }
    });
  };

  if (isLoading) {
    return (
      <PageLayout title="Cohort Overview">
        <div className="space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout 
      title="Cohort Overview" 
      description="Review all cohort members' inquiry progress and provide feedback."
    >
      <div className="space-y-6 pb-12">
        {inquiries?.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 rounded-lg border border-dashed">
            <UserIcon className="h-12 w-12 mx-auto text-slate-300 mb-4" />
            <p className="text-muted-foreground">No cohort members have started their inquiry yet.</p>
          </div>
        ) : (
          inquiries?.map((inquiry) => (
            <Card key={inquiry.id} className="paper-card overflow-hidden">
              <CardHeader className="bg-slate-50 border-b">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <UserIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold text-lg">{inquiry.user?.fullName || "Unknown"}</span>
                      <Badge variant="outline" className="text-xs">
                        @{inquiry.user?.username}
                      </Badge>
                    </div>
                    <CardTitle className="font-serif text-xl text-primary">
                      {inquiry.question || "No research question defined"}
                    </CardTitle>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <p>Started</p>
                    <p className="font-mono">{inquiry.createdAt ? format(new Date(inquiry.createdAt), "MMM d, yyyy") : "N/A"}</p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-4 space-y-6">
                {inquiry.pathway && (
                  <div className="p-4 bg-secondary/30 rounded-lg">
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-2">
                      <BookOpen className="h-4 w-4" /> Learning Pathway
                    </h4>
                    <p className="text-sm whitespace-pre-wrap">{inquiry.pathway}</p>
                  </div>
                )}

                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="reflections" className="border-none">
                    <AccordionTrigger className="hover:no-underline py-2">
                      <span className="flex items-center gap-2 text-sm font-medium">
                        <Calendar className="h-4 w-4" />
                        Reflections ({inquiry.reflections?.length || 0})
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 pt-2">
                        {inquiry.reflections?.length === 0 ? (
                          <p className="text-sm text-muted-foreground italic">No reflections submitted yet.</p>
                        ) : (
                          inquiry.reflections?.map((ref) => (
                            <div key={ref.id} className="p-3 bg-slate-50 rounded-lg border-l-2 border-slate-300">
                              <p className="text-xs text-muted-foreground font-mono mb-1">
                                Week of {format(new Date(ref.weekOf), "MMM d, yyyy")}
                              </p>
                              <p className="text-sm whitespace-pre-wrap">{ref.content}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <div className="border-t pt-4">
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" /> Facilitator Feedback
                  </h4>
                  
                  {inquiry.comments?.length > 0 && (
                    <div className="space-y-2 mb-4">
                      {inquiry.comments.map((comment) => (
                        <div key={comment.id} className="p-3 bg-primary/5 rounded-lg border-l-2 border-primary">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-primary">{comment.user?.fullName}</span>
                            <span className="text-xs text-muted-foreground">
                              {comment.createdAt ? format(new Date(comment.createdAt), "MMM d, h:mm a") : ""}
                            </span>
                          </div>
                          <p className="text-sm">{comment.content}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Add feedback or guidance for this inquiry..."
                      value={commentText[inquiry.id] || ""}
                      onChange={(e) => setCommentText(prev => ({ ...prev, [inquiry.id]: e.target.value }))}
                      className="h-20 resize-none text-sm"
                      data-testid={`textarea-comment-${inquiry.id}`}
                    />
                    <Button
                      onClick={() => handleAddComment(inquiry.id)}
                      disabled={isPending || !commentText[inquiry.id]?.trim()}
                      className="self-end"
                      data-testid={`button-send-comment-${inquiry.id}`}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </PageLayout>
  );
}

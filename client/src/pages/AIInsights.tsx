import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { useUser } from "@/hooks/use-auth";
import { 
  useGenerateJourneySummary, 
  useAiSummaries,
  type AiSummaryOutput 
} from "@/hooks/use-ai";
import { useReportSections } from "@/hooks/use-report";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Sparkles, 
  Brain, 
  Lightbulb, 
  HelpCircle, 
  ArrowRight, 
  Quote,
  FileText,
  Clock,
  Loader2,
  Copy
} from "lucide-react";
import { format } from "date-fns";

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function SummaryCard({ summary, title, generatedAt }: { summary: AiSummaryOutput; title: string; generatedAt?: string }) {
  const date = generatedAt 
    ? new Date(generatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const handleCopyToClipboard = () => {
    let text = `${title}\nGenerated: ${date}\n\n`;
    text += `SUMMARY\n${summary.highLevelSummary}\n\n`;
    
    if (summary.keyThemes.length > 0) {
      text += `KEY THEMES\n${summary.keyThemes.join(', ')}\n\n`;
    }
    
    if (summary.notableQuotes.length > 0) {
      text += `NOTABLE EXCERPTS\n${summary.notableQuotes.map(q => `"${q.text}"`).join('\n')}\n\n`;
    }
    
    if (summary.openQuestions.length > 0) {
      text += `OPEN QUESTIONS\n${summary.openQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}\n\n`;
    }
    
    if (summary.recommendedNextSteps.length > 0) {
      text += `RECOMMENDED NEXT STEPS\n${summary.recommendedNextSteps.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\n`;
    }
    
    if (summary.evidence.length > 0) {
      text += `SUPPORTING EVIDENCE\n${summary.evidence.slice(0, 5).map(ev => `${ev.authorName || 'Unknown'} (${ev.sourceType}): ${ev.excerpt}`).join('\n')}\n`;
    }

    navigator.clipboard.writeText(text).then(() => {
      alert('Summary copied to clipboard! You can paste it into any document.');
    }).catch(() => {
      alert('Unable to copy. Please try selecting and copying the text manually.');
    });
  };

  return (
    <Card className="paper-card">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <CardTitle className="text-lg font-serif flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleCopyToClipboard}
          data-testid="button-copy-summary"
        >
          <Copy className="h-4 w-4 mr-2" />
          Copy to Clipboard
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <p className="text-foreground leading-relaxed">{summary.highLevelSummary}</p>
        </div>

        {summary.keyThemes.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-yellow-500" />
              Key Themes
            </h4>
            <div className="flex flex-wrap gap-2">
              {summary.keyThemes.map((theme, i) => (
                <Badge key={i} variant="secondary">{theme}</Badge>
              ))}
            </div>
          </div>
        )}

        {summary.notableQuotes.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <Quote className="h-4 w-4 text-blue-500" />
              Notable Excerpts
            </h4>
            <div className="space-y-2">
              {summary.notableQuotes.map((quote, i) => (
                <blockquote key={i} className="border-l-2 border-primary/30 pl-3 text-sm text-muted-foreground italic">
                  "{quote.text}"
                </blockquote>
              ))}
            </div>
          </div>
        )}

        {summary.openQuestions.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-purple-500" />
              Open Questions
            </h4>
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              {summary.openQuestions.map((q, i) => (
                <li key={i}>{q}</li>
              ))}
            </ul>
          </div>
        )}

        {summary.recommendedNextSteps.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <ArrowRight className="h-4 w-4 text-green-500" />
              Recommended Next Steps
            </h4>
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              {summary.recommendedNextSteps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ul>
          </div>
        )}

        {summary.evidence.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              Supporting Evidence
            </h4>
            <div className="space-y-2">
              {summary.evidence.slice(0, 5).map((ev, i) => (
                <div key={i} className="text-xs bg-muted/50 rounded p-2">
                  <span className="font-medium">{ev.authorName || "Unknown"}</span>
                  <span className="text-muted-foreground"> ({ev.sourceType})</span>
                  <p className="text-muted-foreground mt-1 line-clamp-2">{ev.excerpt}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function AIInsights() {
  const { user } = useUser();
  const { data: sections } = useReportSections();
  const { data: pastSummaries } = useAiSummaries();
  const { mutate: generateJourney, isPending: isGeneratingJourney, data: journeySummary } = useGenerateJourneySummary();
  
  const [activeTab, setActiveTab] = useState("journey");

  if (!user) return null;

  const journeySummaries = pastSummaries?.filter(s => s.type === "my_journey") || [];

  return (
    <PageLayout 
      title="AI Insights" 
      description="AI-powered summaries and synthesis of your inquiry journey."
    >
      <div className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="journey" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              My Journey
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Past Summaries
            </TabsTrigger>
          </TabsList>

          <TabsContent value="journey" className="space-y-6">
            <Card className="paper-card">
              <CardHeader>
                <CardTitle className="text-xl font-serif flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Summarize My Journey
                </CardTitle>
                <CardDescription>
                  Generate an AI summary of your inquiry journey based on your reflections, contributions, and resources.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => generateJourney()}
                  disabled={isGeneratingJourney}
                  className="w-full sm:w-auto"
                  data-testid="button-generate-journey"
                >
                  {isGeneratingJourney ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing your journey...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Journey Summary
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  This uses AI to analyze your contributions. Charges apply to your Replit credits.
                </p>
              </CardContent>
            </Card>

            {journeySummary && (
              <SummaryCard summary={journeySummary} title="Your Inquiry Journey" />
            )}

            {!journeySummary && journeySummaries.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-3">Most Recent Summary</h3>
                <SummaryCard 
                  summary={journeySummaries[0].content as AiSummaryOutput} 
                  title={`Generated ${format(new Date(journeySummaries[0].generatedAt), "MMM d, yyyy 'at' h:mm a")}`}
                  generatedAt={journeySummaries[0].generatedAt}
                />
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card className="paper-card">
              <CardHeader>
                <CardTitle className="text-xl font-serif flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Past Summaries
                </CardTitle>
                <CardDescription>
                  View your previously generated AI summaries.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {(!pastSummaries || pastSummaries.length === 0) ? (
                  <p className="text-muted-foreground text-center py-8">
                    No summaries generated yet. Go to "My Journey" to create your first summary.
                  </p>
                ) : (
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-4 pr-4">
                      {pastSummaries.map((summary) => {
                        const content = summary.content as AiSummaryOutput;
                        const handleCopyPast = () => {
                          const typeLabel = summary.type === "my_journey" ? "Journey Summary" : 
                                          summary.type === "section_draft" ? "Section Draft" : "Weekly Digest";
                          const date = format(new Date(summary.generatedAt), "MMMM d, yyyy");
                          
                          let text = `${typeLabel}\nGenerated: ${date}\n\n`;
                          text += `SUMMARY\n${content.highLevelSummary}\n\n`;
                          if (content.keyThemes.length > 0) text += `KEY THEMES\n${content.keyThemes.join(', ')}\n\n`;
                          if (content.notableQuotes.length > 0) text += `NOTABLE EXCERPTS\n${content.notableQuotes.map(q => `"${q.text}"`).join('\n')}\n\n`;
                          if (content.openQuestions.length > 0) text += `OPEN QUESTIONS\n${content.openQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}\n\n`;
                          if (content.recommendedNextSteps.length > 0) text += `RECOMMENDED NEXT STEPS\n${content.recommendedNextSteps.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n`;
                          
                          navigator.clipboard.writeText(text).then(() => {
                            alert('Summary copied to clipboard!');
                          }).catch(() => {
                            alert('Unable to copy. Please try manually.');
                          });
                        };
                        
                        return (
                        <Card key={summary.id} className="bg-muted/30">
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <Badge variant="outline">
                                {summary.type === "my_journey" ? "Journey Summary" : 
                                 summary.type === "section_draft" ? "Section Draft" : 
                                 "Weekly Digest"}
                              </Badge>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">
                                  {format(new Date(summary.generatedAt), "MMM d, yyyy")}
                                </span>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={handleCopyPast}
                                  className="h-7 w-7 p-0"
                                  data-testid={`button-copy-past-${summary.id}`}
                                >
                                  <Copy className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm line-clamp-3">
                              {content.highLevelSummary}
                            </p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {content.keyThemes.slice(0, 3).map((theme, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">{theme}</Badge>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                        );
                      })}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}

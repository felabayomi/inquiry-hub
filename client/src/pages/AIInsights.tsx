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
  Printer
} from "lucide-react";
import { format } from "date-fns";

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function SummaryCard({ summary, title, generatedAt }: { summary: AiSummaryOutput; title: string; generatedAt?: string }) {
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to print this content');
      return;
    }

    const styles = `
      <style>
        body { 
          font-family: 'Georgia', serif;
          line-height: 1.6;
          color: #1a1a1a;
          max-width: 800px;
          margin: 0 auto;
          padding: 40px;
        }
        h1 { font-size: 24px; margin-bottom: 8px; }
        h2 { font-size: 18px; margin-top: 24px; margin-bottom: 12px; border-bottom: 1px solid #ddd; padding-bottom: 4px; }
        .generated-at { font-size: 12px; color: #888; margin-bottom: 24px; }
        p { margin-bottom: 12px; }
        ul { margin-bottom: 12px; padding-left: 24px; }
        li { margin-bottom: 6px; }
        blockquote { border-left: 3px solid #666; padding-left: 16px; margin: 16px 0; font-style: italic; color: #555; }
        .theme-tag { display: inline-block; background: #f0f0f0; padding: 2px 8px; border-radius: 4px; font-size: 12px; margin-right: 8px; margin-bottom: 4px; }
        @page { margin: 1in; }
      </style>
    `;

    const date = generatedAt 
      ? new Date(generatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${escapeHtml(title)}</title>
          ${styles}
        </head>
        <body>
          <h1>${escapeHtml(title)}</h1>
          <div class="generated-at">Generated: ${escapeHtml(date)}</div>
          
          <h2>Summary</h2>
          <p>${escapeHtml(summary.highLevelSummary)}</p>
          
          ${summary.keyThemes.length > 0 ? `
            <h2>Key Themes</h2>
            <div>${summary.keyThemes.map(t => `<span class="theme-tag">${escapeHtml(t)}</span>`).join('')}</div>
          ` : ''}
          
          ${summary.notableQuotes.length > 0 ? `
            <h2>Notable Excerpts</h2>
            ${summary.notableQuotes.map(q => `<blockquote>"${escapeHtml(q.text)}"</blockquote>`).join('')}
          ` : ''}
          
          ${summary.openQuestions.length > 0 ? `
            <h2>Open Questions</h2>
            <ul>${summary.openQuestions.map(q => `<li>${escapeHtml(q)}</li>`).join('')}</ul>
          ` : ''}
          
          ${summary.recommendedNextSteps.length > 0 ? `
            <h2>Recommended Next Steps</h2>
            <ul>${summary.recommendedNextSteps.map((s, i) => `<li><strong>${i + 1}.</strong> ${escapeHtml(s)}</li>`).join('')}</ul>
          ` : ''}
          
          ${summary.evidence.length > 0 ? `
            <h2>Supporting Evidence</h2>
            ${summary.evidence.slice(0, 5).map(ev => `
              <p><strong>${escapeHtml(ev.authorName || 'Unknown')}</strong> (${escapeHtml(ev.sourceType)})<br/>
              <em>${escapeHtml(ev.excerpt)}</em></p>
            `).join('')}
          ` : ''}
        </body>
      </html>
    `);

    printWindow.document.close();
    setTimeout(() => printWindow.print(), 250);
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
          onClick={handlePrint}
          data-testid="button-print-summary"
        >
          <Printer className="h-4 w-4 mr-2" />
          Print / Save PDF
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
                        const handlePrintPast = () => {
                          const printWindow = window.open('', '_blank');
                          if (!printWindow) return;
                          
                          const typeLabel = summary.type === "my_journey" ? "Journey Summary" : 
                                          summary.type === "section_draft" ? "Section Draft" : "Weekly Digest";
                          const date = format(new Date(summary.generatedAt), "MMMM d, yyyy");
                          
                          printWindow.document.write(`
                            <!DOCTYPE html>
                            <html>
                              <head>
                                <title>${escapeHtml(typeLabel)} - ${escapeHtml(date)}</title>
                                <style>
                                  body { font-family: 'Georgia', serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 40px; }
                                  h1 { font-size: 24px; margin-bottom: 8px; }
                                  h2 { font-size: 18px; margin-top: 24px; margin-bottom: 12px; border-bottom: 1px solid #ddd; padding-bottom: 4px; }
                                  .generated-at { font-size: 12px; color: #888; margin-bottom: 24px; }
                                  p { margin-bottom: 12px; }
                                  ul { padding-left: 24px; }
                                  li { margin-bottom: 6px; }
                                  blockquote { border-left: 3px solid #666; padding-left: 16px; margin: 16px 0; font-style: italic; color: #555; }
                                  .theme-tag { display: inline-block; background: #f0f0f0; padding: 2px 8px; border-radius: 4px; font-size: 12px; margin-right: 8px; }
                                  @page { margin: 1in; }
                                </style>
                              </head>
                              <body>
                                <h1>${escapeHtml(typeLabel)}</h1>
                                <div class="generated-at">Generated: ${escapeHtml(date)}</div>
                                <h2>Summary</h2>
                                <p>${escapeHtml(content.highLevelSummary)}</p>
                                ${content.keyThemes.length > 0 ? `<h2>Key Themes</h2><div>${content.keyThemes.map(t => `<span class="theme-tag">${escapeHtml(t)}</span>`).join('')}</div>` : ''}
                                ${content.notableQuotes.length > 0 ? `<h2>Notable Excerpts</h2>${content.notableQuotes.map(q => `<blockquote>"${escapeHtml(q.text)}"</blockquote>`).join('')}` : ''}
                                ${content.openQuestions.length > 0 ? `<h2>Open Questions</h2><ul>${content.openQuestions.map(q => `<li>${escapeHtml(q)}</li>`).join('')}</ul>` : ''}
                                ${content.recommendedNextSteps.length > 0 ? `<h2>Recommended Next Steps</h2><ul>${content.recommendedNextSteps.map((s, i) => `<li><strong>${i + 1}.</strong> ${escapeHtml(s)}</li>`).join('')}</ul>` : ''}
                              </body>
                            </html>
                          `);
                          printWindow.document.close();
                          setTimeout(() => printWindow.print(), 250);
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
                                  onClick={handlePrintPast}
                                  className="h-7 w-7 p-0"
                                  data-testid={`button-print-past-${summary.id}`}
                                >
                                  <Printer className="h-3.5 w-3.5" />
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

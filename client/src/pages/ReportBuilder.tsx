import { useState, useEffect, useMemo, useRef } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { 
  useReportSections, 
  useSaveVersion, 
  useSectionComments,
  useAddComment,
  useJusticeLenses,
  useAllVersionsWithEngagement,
  useMyReadVersionIds,
  useMarkVersionRead,
  useToggleReaction,
  useTotalUsersCount,
  type VersionWithEngagement
} from "@/hooks/use-report";
import { useUser } from "@/hooks/use-auth";
import { useGenerateSectionSynthesis, type AiSummaryOutput } from "@/hooks/use-ai";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { 
  Eye, 
  MessageSquare, 
  Tag, 
  Save, 
  ChevronDown, 
  ChevronUp, 
  Lightbulb, 
  Sparkles, 
  Heart, 
  Brain,
  Plus,
  Bot,
  Loader2,
  Quote,
  HelpCircle,
  ArrowRight,
  Copy,
  ExternalLink,
  FileText
} from "lucide-react";
import { format } from "date-fns";

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

const REACTION_TYPES = [
  { type: "insightful", icon: Lightbulb, label: "Insightful", color: "text-yellow-500" },
  { type: "well_written", icon: Sparkles, label: "Well written", color: "text-blue-500" },
  { type: "thoughtful", icon: Brain, label: "Makes me think", color: "text-purple-500" },
  { type: "love", icon: Heart, label: "Love this", color: "text-red-500" },
];

function getInitials(name: string) {
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}

function VersionCard({ 
  version, 
  isUnread,
  currentUserId,
  totalUsers,
  onMarkRead,
  isHighlighted
}: { 
  version: VersionWithEngagement;
  isUnread: boolean;
  currentUserId: number;
  totalUsers: number;
  onMarkRead: () => void;
  isHighlighted?: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(isHighlighted || false);
  const { mutate: toggleReaction } = useToggleReaction();
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isHighlighted && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (isUnread) {
        onMarkRead();
      }
    }
  }, [isHighlighted]);

  const handleExpand = () => {
    if (!isExpanded && isUnread) {
      onMarkRead();
    }
    setIsExpanded(!isExpanded);
  };

  const reactionCounts = useMemo(() => {
    const counts: Record<string, { count: number; users: string[]; hasReacted: boolean }> = {};
    REACTION_TYPES.forEach(r => {
      counts[r.type] = { count: 0, users: [], hasReacted: false };
    });
    version.reactions.forEach(r => {
      if (counts[r.reactionType]) {
        counts[r.reactionType].count++;
        counts[r.reactionType].users.push(r.user.fullName);
        if (r.userId === currentUserId) {
          counts[r.reactionType].hasReacted = true;
        }
      }
    });
    return counts;
  }, [version.reactions, currentUserId]);

  const readCount = version.reads.length;
  const readNames = version.reads.map(r => r.user.fullName);

  const previewText = version.content.slice(0, 200) + (version.content.length > 200 ? "..." : "");

  return (
    <Card 
      ref={cardRef}
      className={cn(
        "transition-all",
        isUnread && "ring-2 ring-primary/50 bg-primary/5",
        isHighlighted && "ring-2 ring-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 animate-pulse"
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10 flex-shrink-0">
            <AvatarFallback className="bg-muted text-xs">
              {getInitials(version.author.fullName)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-medium text-sm">{version.author.fullName}</span>
              {isUnread && (
                <Badge variant="default" className="text-xs">New</Badge>
              )}
              <span className="text-xs text-muted-foreground">
                {version.createdAt ? format(new Date(version.createdAt), "MMM d, h:mm a") : ""}
              </span>
            </div>

            <div className="mb-3">
              {isExpanded ? (
                <p className="text-sm text-foreground whitespace-pre-wrap font-serif leading-relaxed">
                  {version.content}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {previewText}
                </p>
              )}
            </div>

            {version.justiceLensTags && version.justiceLensTags.length > 0 && (
              <div className="flex gap-1 flex-wrap mb-3">
                {version.justiceLensTags.map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    <Tag className="h-3 w-3 mr-1" />
                    {tag.replace('_', ' ')}
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-3">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground cursor-default">
                      <Eye className="h-3.5 w-3.5" />
                      <span>{readCount}/{totalUsers}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">
                      {readCount === 0 
                        ? "No one has read this yet" 
                        : `Read by: ${readNames.join(", ")}`}
                    </p>
                  </TooltipContent>
                </Tooltip>

                <div className="flex items-center gap-1">
                  {REACTION_TYPES.map(({ type, icon: Icon, label, color }) => {
                    const data = reactionCounts[type];
                    return (
                      <Tooltip key={type}>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={cn(
                              "h-7 px-2 gap-1",
                              data.hasReacted && "bg-muted"
                            )}
                            onClick={() => toggleReaction({ versionId: version.id, reactionType: type })}
                            data-testid={`button-reaction-${type}-${version.id}`}
                          >
                            <Icon className={cn("h-3.5 w-3.5", data.hasReacted ? color : "text-muted-foreground")} />
                            {data.count > 0 && (
                              <span className="text-xs">{data.count}</span>
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">
                            {data.count === 0 
                              ? label 
                              : `${label}: ${data.users.join(", ")}`}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              </div>

              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleExpand}
                className="h-7 text-xs"
                data-testid={`button-expand-${version.id}`}
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="h-3 w-3 mr-1" />
                    Collapse
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3 w-3 mr-1" />
                    Read more
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CommentsSidebar({ sectionId }: { sectionId: number }) {
  const { data: comments } = useSectionComments(sectionId);
  const { mutate: addComment, isPending } = useAddComment();
  const [newComment, setNewComment] = useState("");

  const handleComment = () => {
    if (!newComment.trim()) return;
    addComment({ sectionId, content: newComment });
    setNewComment("");
  };

  return (
    <div className="w-full lg:w-80 lg:border-l border-border bg-muted/30 flex flex-col lg:h-[calc(100vh-8rem)] lg:sticky lg:top-24">
      <div className="p-4 border-b border-border">
        <h3 className="font-medium flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Section Discussion
        </h3>
      </div>
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {comments?.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No comments yet. Start the discussion!</p>
          )}
          {comments?.map((comment) => (
            <div key={comment.id} className="bg-background p-3 rounded-lg border border-border shadow-sm text-sm">
              <div className="flex justify-between items-baseline mb-1">
                <span className="font-medium">{comment.author.fullName}</span>
                <span className="text-xs text-muted-foreground">
                  {comment.createdAt ? format(new Date(comment.createdAt), "MMM d") : ""}
                </span>
              </div>
              <p className="text-muted-foreground">{comment.content}</p>
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="p-4 border-t border-border bg-background">
        <Textarea 
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="mb-2 h-20 text-sm"
          data-testid="textarea-new-comment"
        />
        <Button size="sm" className="w-full" onClick={handleComment} disabled={isPending} data-testid="button-post-comment">
          Post
        </Button>
      </div>
    </div>
  );
}

function SectionFeed({ 
  sectionId,
  versions,
  myReadIds,
  currentUserId,
  totalUsers,
  onMarkRead,
  highlightedVersionId
}: { 
  sectionId: number;
  versions: VersionWithEngagement[];
  myReadIds: number[];
  currentUserId: number;
  totalUsers: number;
  onMarkRead: (versionId: number) => void;
  highlightedVersionId?: number | null;
}) {
  const sectionVersions = versions.filter(v => v.sectionId === sectionId);
  const [showEditor, setShowEditor] = useState(false);
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const { mutate: saveVersion, isPending } = useSaveVersion();
  const { data: justiceLenses } = useJusticeLenses();

  const handleSave = () => {
    if (!content.trim()) return;
    saveVersion({ sectionId, content, justiceLensTags: tags });
    setContent("");
    setTags([]);
    setShowEditor(false);
  };

  if (sectionVersions.length === 0 && !showEditor) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">No posts yet in this section.</p>
        <Button onClick={() => setShowEditor(true)} data-testid="button-first-post">
          <Plus className="h-4 w-4 mr-2" />
          Be the first to contribute
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!showEditor ? (
        <Button 
          onClick={() => setShowEditor(true)} 
          className="w-full"
          data-testid="button-new-post"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add your contribution
        </Button>
      ) : (
        <Card className="p-4">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your thoughts on this section..."
            className="min-h-[150px] mb-3 font-serif"
            data-testid="textarea-new-post"
          />
          <div className="flex flex-wrap gap-2 mb-3">
            {(justiceLenses || []).map(lens => (
              <Badge
                key={lens.slug}
                variant={tags.includes(lens.slug) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => {
                  if (tags.includes(lens.slug)) {
                    setTags(tags.filter(t => t !== lens.slug));
                  } else {
                    setTags([...tags, lens.slug]);
                  }
                }}
              >
                {lens.label}
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={isPending || !content.trim()} data-testid="button-submit-post">
              <Save className="h-4 w-4 mr-2" />
              {isPending ? "Saving..." : "Post"}
            </Button>
            <Button variant="ghost" onClick={() => { setShowEditor(false); setContent(""); setTags([]); }}>
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {sectionVersions.map(version => (
        <VersionCard
          key={version.id}
          version={version}
          isUnread={!myReadIds.includes(version.id)}
          currentUserId={currentUserId}
          totalUsers={totalUsers}
          onMarkRead={() => onMarkRead(version.id)}
          isHighlighted={highlightedVersionId === version.id}
        />
      ))}
    </div>
  );
}

function AiSynthesisDialog({ 
  open, 
  onOpenChange, 
  synthesis,
  isLoading,
  sectionTitle
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  synthesis: AiSummaryOutput | null;
  isLoading: boolean;
  sectionTitle: string;
}) {
  const handleCopyToClipboard = () => {
    if (!synthesis) return;

    const date = new Date().toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });

    let text = `AI Synthesis: ${sectionTitle}\nGenerated: ${date}\n\n`;
    text += `SUMMARY\n${synthesis.highLevelSummary}\n\n`;
    
    if (synthesis.keyThemes.length > 0) {
      text += `KEY THEMES\n${synthesis.keyThemes.join(', ')}\n\n`;
    }
    
    if (synthesis.notableQuotes.length > 0) {
      text += `NOTABLE QUOTES\n${synthesis.notableQuotes.map(q => `"${q.text}"`).join('\n')}\n\n`;
    }
    
    if (synthesis.openQuestions.length > 0) {
      text += `OPEN QUESTIONS\n${synthesis.openQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}\n\n`;
    }
    
    if (synthesis.recommendedNextSteps.length > 0) {
      text += `RECOMMENDED NEXT STEPS\n${synthesis.recommendedNextSteps.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n`;
    }

    navigator.clipboard.writeText(text).then(() => {
      alert('Summary copied to clipboard! You can paste it into any document.');
    }).catch(() => {
      alert('Unable to copy. Please try selecting and copying the text manually.');
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            AI Synthesis: {sectionTitle}
          </DialogTitle>
          <DialogDescription>
            AI-generated summary of all contributions in this section
          </DialogDescription>
        </DialogHeader>

        {!isLoading && synthesis && (
          <div className="flex justify-end mb-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleCopyToClipboard}
              data-testid="button-copy-synthesis"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy to Clipboard
            </Button>
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Analyzing contributions...</p>
          </div>
        ) : synthesis ? (
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">{synthesis.highLevelSummary}</p>
              </CardContent>
            </Card>

            {synthesis.keyThemes.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Key Themes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {synthesis.keyThemes.map((theme, i) => (
                      <Badge key={i} variant="secondary">{theme}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {synthesis.notableQuotes.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Quote className="h-4 w-4" />
                    Notable Quotes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {synthesis.notableQuotes.map((quote, i) => (
                    <blockquote key={i} className="border-l-2 border-primary pl-4 italic text-sm text-muted-foreground">
                      "{quote.text}"
                    </blockquote>
                  ))}
                </CardContent>
              </Card>
            )}

            {synthesis.openQuestions.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <HelpCircle className="h-4 w-4" />
                    Open Questions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {synthesis.openQuestions.map((q, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-primary">•</span>
                        {q}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {synthesis.recommendedNextSteps.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <ArrowRight className="h-4 w-4" />
                    Recommended Next Steps
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {synthesis.recommendedNextSteps.map((step, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="font-medium text-primary">{i + 1}.</span>
                        {step}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {synthesis.evidence && synthesis.evidence.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Supporting Evidence
                    <span className="text-xs text-muted-foreground font-normal">(click to view)</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {synthesis.evidence.slice(0, 5).map((ev, i) => {
                    const sourceLabel = ev.sourceType === "report_post" ? "contribution" :
                      ev.sourceType === "reflection" ? "reflection" :
                      ev.sourceType === "resource" ? "resource" :
                      ev.sourceType === "comment" ? "comment" : "content";

                    return (
                      <div 
                        key={i} 
                        className="text-xs bg-muted/50 rounded p-2 hover-elevate cursor-pointer group"
                        onClick={() => {
                          onOpenChange(false);
                          if (ev.sourceType === "report_post" && ev.sourceId) {
                            window.location.href = `/report?highlight=${ev.sourceId}`;
                          }
                        }}
                        data-testid={`evidence-item-${i}`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-medium">{ev.authorName || "Unknown"}</span>
                            <span className="text-muted-foreground"> ({sourceLabel})</span>
                          </div>
                          <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <p className="text-muted-foreground mt-1 line-clamp-2">{ev.excerpt}</p>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No synthesis available yet.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function ReportBuilder() {
  const { user } = useUser();
  const { data: sections } = useReportSections();
  const { data: allVersions, isLoading: versionsLoading } = useAllVersionsWithEngagement();
  const { data: myReadIds = [] } = useMyReadVersionIds();
  const { mutate: markRead } = useMarkVersionRead();
  const { data: totalUsers = 5 } = useTotalUsersCount();
  const [activeTab, setActiveTab] = useState<string>("");
  const [synthesisDialogOpen, setSynthesisDialogOpen] = useState(false);
  const [currentSynthesis, setCurrentSynthesis] = useState<AiSummaryOutput | null>(null);
  const [synthesizingSectionId, setSynthesizingSectionId] = useState<number | null>(null);
  const [synthesisDialogTitle, setSynthesisDialogTitle] = useState<string>("Section");
  const [highlightedVersionId, setHighlightedVersionId] = useState<number | null>(null);
  const { mutate: generateSynthesis, isPending: isSynthesizing } = useGenerateSectionSynthesis();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const highlightParam = params.get('highlight');
    if (highlightParam) {
      const versionId = parseInt(highlightParam, 10);
      if (!isNaN(versionId)) {
        setHighlightedVersionId(versionId);
        // Find the section containing this version and switch to it
        if (allVersions && sections) {
          const version = allVersions.find(v => v.id === versionId);
          if (version) {
            const section = sections.find(s => s.id === version.sectionId);
            if (section) {
              setActiveTab(section.slug);
            }
          }
        }
        // Clear highlight after 5 seconds
        setTimeout(() => {
          setHighlightedVersionId(null);
          // Also clear the URL parameter
          window.history.replaceState({}, '', window.location.pathname);
        }, 5000);
      }
    }
  }, [allVersions, sections]);

  useEffect(() => {
    if (sections && sections.length > 0 && !activeTab) {
      setActiveTab(sections[0].slug);
    }
  }, [sections, activeTab]);

  const unreadCount = useMemo(() => {
    if (!allVersions) return 0;
    return allVersions.filter(v => !myReadIds.includes(v.id) && v.userId !== user?.id).length;
  }, [allVersions, myReadIds, user?.id]);

  const unreadBySection = useMemo(() => {
    if (!allVersions || !sections) return {};
    const counts: Record<string, number> = {};
    sections.forEach(s => {
      counts[s.slug] = allVersions.filter(v => 
        v.sectionId === s.id && 
        !myReadIds.includes(v.id) && 
        v.userId !== user?.id
      ).length;
    });
    return counts;
  }, [allVersions, sections, myReadIds, user?.id]);

  const handleSynthesizeSection = (sectionId: number, sectionTitle: string) => {
    // Prevent starting a new synthesis while one is in progress
    if (isSynthesizing) return;
    
    setSynthesizingSectionId(sectionId);
    setSynthesisDialogTitle(sectionTitle);
    setCurrentSynthesis(null);
    setSynthesisDialogOpen(true);
    generateSynthesis(sectionId, {
      onSuccess: (data) => {
        setCurrentSynthesis(data);
        setSynthesizingSectionId(null);
      },
      onError: () => {
        setSynthesizingSectionId(null);
      }
    });
  };

  if (!user) return null;
  if (!activeTab) return <PageLayout title="Report Builder">Loading...</PageLayout>;

  const activeSection = sections?.find(s => s.slug === activeTab);

  return (
    <PageLayout 
      title="Report Builder" 
      description="Collaboratively draft the cohort report."
      action={
        unreadCount > 0 ? (
          <Badge variant="secondary" className="text-sm">
            {unreadCount} new update{unreadCount !== 1 ? "s" : ""} since your last visit
          </Badge>
        ) : null
      }
    >
      <div className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex-wrap h-auto gap-1">
            {sections?.sort((a, b) => a.orderIndex - b.orderIndex).map(section => (
              <TabsTrigger 
                key={section.slug} 
                value={section.slug}
                className="relative"
                data-testid={`tab-section-${section.slug}`}
              >
                {section.title}
                {unreadBySection[section.slug] > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {unreadBySection[section.slug]}
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {sections?.map(section => (
            <TabsContent key={section.slug} value={section.slug} className="mt-6">
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1">
                  {/* Section Header with optional description and AI button */}
                  <div className="mb-4 space-y-3">
                    <div className="flex items-center justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSynthesizeSection(section.id, section.title)}
                        disabled={isSynthesizing}
                        data-testid={`button-synthesize-${section.slug}`}
                      >
                        {isSynthesizing && synthesizingSectionId === section.id ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Bot className="h-4 w-4 mr-2" />
                        )}
                        AI Synthesis
                      </Button>
                    </div>
                    {section.description && (
                      <Card className="bg-muted/50">
                        <CardContent className="p-4">
                          <p className="text-sm text-muted-foreground">{section.description}</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  {versionsLoading ? (
                    <div className="text-center py-8 text-muted-foreground">Loading posts...</div>
                  ) : (
                    <SectionFeed
                      sectionId={section.id}
                      versions={allVersions || []}
                      myReadIds={myReadIds}
                      currentUserId={user.id}
                      totalUsers={totalUsers}
                      onMarkRead={(versionId) => markRead(versionId)}
                      highlightedVersionId={highlightedVersionId}
                    />
                  )}
                </div>

                <div className="hidden lg:block">
                  <CommentsSidebar sectionId={section.id} />
                </div>

                <Sheet>
                  <SheetTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="fixed bottom-4 right-4 lg:hidden h-12 w-12 rounded-full shadow-lg"
                      data-testid="button-mobile-sidebar"
                    >
                      <MessageSquare className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[300px] p-0">
                    <CommentsSidebar sectionId={section.id} />
                  </SheetContent>
                </Sheet>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      <AiSynthesisDialog
        open={synthesisDialogOpen}
        onOpenChange={setSynthesisDialogOpen}
        synthesis={currentSynthesis}
        isLoading={isSynthesizing}
        sectionTitle={synthesisDialogTitle}
      />
    </PageLayout>
  );
}

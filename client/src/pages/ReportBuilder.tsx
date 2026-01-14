import { useState, useEffect } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { 
  useReportSections, 
  useLatestVersion, 
  useSaveVersion, 
  useVersionHistory, 
  useSectionComments,
  useAddComment 
} from "@/hooks/use-report";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { History, MessageSquare, Tag, Save, ChevronRight, ChevronLeft, Menu, PanelRight } from "lucide-react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

// Right sidebar component for Lens and Comments
function ReportSidebar({ 
  sectionId, 
  tags, 
  setTags 
}: { 
  sectionId: number, 
  tags: string[], 
  setTags: (t: string[]) => void 
}) {
  const { data: comments } = useSectionComments(sectionId);
  const { mutate: addComment, isPending } = useAddComment();
  const [newComment, setNewComment] = useState("");

  const justiceLenses = [
    { id: "who_benefits", label: "Who benefits?" },
    { id: "who_is_harmed", label: "Who is harmed?" },
    { id: "labor", label: "Invisible Labor" },
    { id: "power", label: "Power Dynamics" },
  ];

  const toggleTag = (tag: string) => {
    if (tags.includes(tag)) {
      setTags(tags.filter(t => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
  };

  const handleComment = () => {
    if (!newComment.trim()) return;
    addComment({ sectionId, content: newComment });
    setNewComment("");
  };

  return (
    <div className="w-full lg:w-80 lg:border-l border-border bg-slate-50 flex flex-col lg:h-[calc(100vh-8rem)] lg:sticky lg:top-24">
      <Tabs defaultValue="lens" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="lens">Justice Lens</TabsTrigger>
          <TabsTrigger value="comments">Comments</TabsTrigger>
        </TabsList>
        
        <TabsContent value="lens" className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold mb-2">Apply a Lens</h3>
              <p className="text-xs text-muted-foreground mb-4">
                Tag this draft with the lenses you've considered.
              </p>
              <div className="space-y-2">
                {justiceLenses.map(lens => (
                  <div 
                    key={lens.id}
                    onClick={() => toggleTag(lens.id)}
                    className={cn(
                      "p-3 rounded-md cursor-pointer border transition-all text-sm flex items-center justify-between",
                      tags.includes(lens.id)
                        ? "bg-primary/10 border-primary text-primary"
                        : "bg-white border-slate-200 hover:border-slate-300"
                    )}
                  >
                    {lens.label}
                    {tags.includes(lens.id) && <Tag className="h-3 w-3" />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="comments" className="flex-1 flex flex-col p-0">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {comments?.map((comment) => (
                <div key={comment.id} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm text-sm">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="font-bold text-slate-700">{comment.author.fullName}</span>
                    <span className="text-xs text-slate-400">{comment.createdAt ? format(new Date(comment.createdAt), "MMM d") : ""}</span>
                  </div>
                  <p className="text-slate-600">{comment.content}</p>
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="p-4 border-t border-slate-200 bg-white">
            <Textarea 
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="mb-2 h-20 text-sm"
            />
            <Button size="sm" className="w-full" onClick={handleComment} disabled={isPending}>
              Post
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Main Editor Component
export default function ReportBuilder() {
  const { data: sections } = useReportSections();
  const [activeSectionId, setActiveSectionId] = useState<number | null>(null);
  
  // Set first section as active when loaded
  useEffect(() => {
    if (sections && sections.length > 0 && !activeSectionId) {
      setActiveSectionId(sections[0].id);
    }
  }, [sections]);

  const activeSection = sections?.find(s => s.id === activeSectionId);

  if (!activeSectionId) return <PageLayout title="Report Builder">Loading...</PageLayout>;

  return (
    <PageLayout 
      title="Report Builder" 
      description="Collaboratively draft the cohort report."
      action={
        <div className="flex items-center text-sm text-slate-500">
          <span className="mr-2 hidden sm:inline">Autosave disabled</span>
        </div>
      }
    >
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 -mx-4 lg:-mx-8 px-4 lg:px-8 pb-8">
        {/* Mobile Section Selector */}
        <div className="lg:hidden">
          <Select 
            value={activeSectionId?.toString()} 
            onValueChange={(val) => setActiveSectionId(Number(val))}
          >
            <SelectTrigger data-testid="select-section-mobile" className="w-full">
              <SelectValue placeholder="Select section">
                {activeSection?.title || "Select section"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-background">
              {sections?.sort((a,b) => a.orderIndex - b.orderIndex).map(section => (
                <SelectItem key={section.id} value={section.id.toString()}>
                  {section.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Desktop Navigation Rail */}
        <div className="hidden lg:block w-48 flex-shrink-0 space-y-1">
          {sections?.sort((a,b) => a.orderIndex - b.orderIndex).map(section => (
            <button
              key={section.id}
              data-testid={`button-section-${section.id}`}
              onClick={() => setActiveSectionId(section.id)}
              className={cn(
                "w-full text-left px-4 py-2 rounded-md text-sm transition-colors",
                activeSectionId === section.id 
                  ? "bg-slate-200 font-medium text-slate-900" 
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              {section.title}
            </button>
          ))}
        </div>

        {/* Editor Area */}
        <div className="flex-1 min-w-0">
          <SectionEditor key={activeSectionId} sectionId={activeSectionId} />
        </div>
      </div>
    </PageLayout>
  );
}

function SectionEditor({ sectionId }: { sectionId: number }) {
  const { data: latestVersion, isLoading } = useLatestVersion(sectionId);
  const { data: history } = useVersionHistory(sectionId);
  const { mutate: saveVersion, isPending: isSaving } = useSaveVersion();
  
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Initialize content
  useEffect(() => {
    if (latestVersion) {
      setContent(latestVersion.content);
      setTags(latestVersion.justiceLensTags || []);
    } else {
      setContent("");
      setTags([]);
    }
  }, [latestVersion]);

  const handleSave = () => {
    saveVersion({
      sectionId,
      content,
      justiceLensTags: tags,
    });
  };

  if (isLoading) return <div className="h-96 flex items-center justify-center">Loading section...</div>;

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
      <div className="flex-1">
        <Card className="min-h-[400px] lg:min-h-[600px] flex flex-col shadow-md border-slate-200">
          <div className="p-3 lg:p-4 border-b border-slate-100 flex flex-wrap justify-between items-center gap-2 bg-white rounded-t-xl sticky top-0 z-10">
            <div className="flex gap-2 flex-wrap">
              {tags.map(tag => (
                <Badge key={tag} variant="outline" className="text-xs bg-slate-50">
                  {tag.replace('_', ' ')}
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
               <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" data-testid="button-history">
                    <History className="h-4 w-4 lg:mr-2" />
                    <span className="hidden lg:inline">History</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                   <h3 className="font-serif text-xl mb-4">Version History</h3>
                   <div className="space-y-4">
                     {history?.map(version => (
                       <div key={version.id} className="border-b pb-4">
                         <div className="flex justify-between text-sm mb-2">
                            <span className="font-bold">{version.author.fullName}</span>
                            <span className="text-muted-foreground">{version.createdAt ? format(new Date(version.createdAt), "PP p") : ""}</span>
                         </div>
                         <p className="text-sm text-slate-600 line-clamp-3 font-serif bg-slate-50 p-2 rounded">{version.content}</p>
                       </div>
                     ))}
                   </div>
                </DialogContent>
               </Dialog>

              {/* Mobile sidebar trigger */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="lg:hidden" data-testid="button-sidebar-mobile">
                    <PanelRight className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] p-0">
                  <ReportSidebar sectionId={sectionId} tags={tags} setTags={setTags} />
                </SheetContent>
              </Sheet>

              <Button onClick={handleSave} disabled={isSaving} size="sm" data-testid="button-save-draft">
                <Save className="h-4 w-4 lg:mr-2" />
                <span className="hidden lg:inline">{isSaving ? "Saving..." : "Save Draft"}</span>
              </Button>
            </div>
          </div>
          <Textarea 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="flex-1 border-0 focus-visible:ring-0 resize-none p-4 lg:p-8 font-serif text-base lg:text-lg leading-relaxed rounded-b-xl rounded-t-none"
            placeholder="Start drafting this section..."
            data-testid="textarea-content"
          />
        </Card>
      </div>

      {/* Desktop sidebar - hidden on mobile */}
      <div className="hidden lg:block">
        <ReportSidebar sectionId={sectionId} tags={tags} setTags={setTags} />
      </div>
    </div>
  );
}

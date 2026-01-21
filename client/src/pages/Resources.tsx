import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { useResources, useCreateResource } from "@/hooks/use-resources";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ExternalLink, Plus, Search } from "lucide-react";

export default function Resources() {
  const { data: resources, isLoading } = useResources();
  const { mutate: createResource, isPending } = useCreateResource();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    url: "",
    tags: "",
    annotation: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createResource({
      title: formData.title,
      url: formData.url,
      tags: formData.tags.split(",").map(t => t.trim()).filter(Boolean),
      annotation: formData.annotation,
      visibility: "private",
    }, {
      onSuccess: () => {
        setIsOpen(false);
        setFormData({ title: "", url: "", tags: "", annotation: "" });
      }
    });
  };

  const filteredResources = resources?.filter(r => 
    r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoading) return <PageLayout title="Resources">Loading...</PageLayout>;

  return (
    <PageLayout 
      title="Resources" 
      description="Save and organize useful links, articles, and references."
      action={
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-resource">
              <Plus className="mr-2 h-4 w-4" /> Add Resource
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Resource</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input 
                  id="title" 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  required
                  data-testid="input-resource-title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="url">URL</Label>
                <Input 
                  id="url" 
                  type="url"
                  value={formData.url} 
                  onChange={e => setFormData({...formData, url: e.target.value})}
                  required
                  data-testid="input-resource-url"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input 
                  id="tags" 
                  value={formData.tags} 
                  onChange={e => setFormData({...formData, tags: e.target.value})}
                  placeholder="e.g. AI, methodology, ethics"
                  data-testid="input-resource-tags"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="annotation">Notes (Why is this useful?)</Label>
                <Textarea 
                  id="annotation" 
                  value={formData.annotation} 
                  onChange={e => setFormData({...formData, annotation: e.target.value})}
                  className="h-24"
                  data-testid="input-resource-annotation"
                />
              </div>
              <Button type="submit" className="w-full" disabled={isPending} data-testid="button-submit-resource">
                {isPending ? "Adding..." : "Add to Library"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      }
    >
      <div className="mb-8 relative">
        <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
        <Input 
          placeholder="Search by title or tag..." 
          className="pl-10 h-12 text-lg"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          data-testid="input-search-resources"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredResources?.map((resource) => (
          <Card key={resource.id} className="paper-card flex flex-col" data-testid={`resource-card-${resource.id}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-serif leading-snug">{resource.title}</CardTitle>
              <CardDescription className="text-xs mt-1">
                Added on {new Date(resource.createdAt!).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-3">
              {resource.annotation && (
                <p className="text-sm text-muted-foreground">{resource.annotation}</p>
              )}
              <div className="flex flex-wrap gap-1 mt-auto">
                {resource.tags?.map((tag, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">{tag}</Badge>
                ))}
              </div>
              <a 
                href={resource.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline flex items-center gap-1 mt-2"
              >
                <ExternalLink className="h-3 w-3" /> View Resource
              </a>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredResources?.length === 0 && (
        <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed border-slate-300">
          <p className="text-muted-foreground">No resources yet. Start building your library!</p>
        </div>
      )}
    </PageLayout>
  );
}

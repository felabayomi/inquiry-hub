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
    }, {
      onSuccess: () => {
        setIsOpen(false);
        setFormData({ title: "", url: "", tags: "", annotation: "" });
      }
    });
  };

  const filteredResources = resources?.filter(r => 
    r.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.tags?.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <PageLayout 
      title="Shared Resources" 
      description="A collective library of knowledge from the cohort."
      action={
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" /> Add Resource
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="font-serif text-xl">Contribute Resource</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input 
                  id="title" 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  required 
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
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input 
                  id="tags" 
                  value={formData.tags} 
                  onChange={e => setFormData({...formData, tags: e.target.value})}
                  placeholder="history, methodology, ethics"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="annotation">Annotation (Why is this useful?)</Label>
                <Textarea 
                  id="annotation" 
                  value={formData.annotation} 
                  onChange={e => setFormData({...formData, annotation: e.target.value})}
                  className="h-24"
                />
              </div>
              <Button type="submit" className="w-full" disabled={isPending}>
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
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredResources?.map((resource) => (
          <Card key={resource.id} className="paper-card flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-start gap-4">
                <CardTitle className="text-lg leading-tight font-serif hover:text-primary transition-colors">
                  <a href={resource.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                    {resource.title}
                    <ExternalLink className="h-4 w-4 opacity-50" />
                  </a>
                </CardTitle>
              </div>
              <CardDescription className="text-xs mt-1">
                Shared by {resource.user.fullName}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between">
              <p className="text-sm text-foreground/80 mb-4 line-clamp-3">
                {resource.annotation || "No annotation provided."}
              </p>
              <div className="flex flex-wrap gap-2 mt-auto">
                {resource.tags?.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs font-normal">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageLayout>
  );
}

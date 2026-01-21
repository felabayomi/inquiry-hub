import { useState, useEffect } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  Plus, 
  Save, 
  Trash2, 
  CheckCircle, 
  Circle, 
  Map, 
  Layers, 
  Settings2,
  Sparkles 
} from "lucide-react";
import { useUser } from "@/hooks/use-auth";
import { useReportSections, useJusticeLenses } from "@/hooks/use-report";
import { 
  useInquiryMappings, 
  useActiveMapping,
  useSectionLensMappings, 
  useCreateMapping, 
  useUpdateMapping, 
  useDeleteMapping,
  useSetActiveMapping,
  useSaveSectionMappings
} from "@/hooks/use-inquiry-mappings";
import type { InquiryMapping, SectionLensMapping, ReportSection, JusticeLens } from "@shared/schema";

export default function InquiryMappingPage() {
  const { user } = useUser();
  const { data: mappings } = useInquiryMappings();
  const { data: activeMapping } = useActiveMapping();
  const { data: sections } = useReportSections();
  const { data: lenses } = useJusticeLenses();
  
  const [selectedMappingId, setSelectedMappingId] = useState<number | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newMappingName, setNewMappingName] = useState("");
  const [newMappingDescription, setNewMappingDescription] = useState("");
  
  const { data: sectionMappings } = useSectionLensMappings(selectedMappingId || undefined);
  
  const createMapping = useCreateMapping();
  const updateMapping = useUpdateMapping();
  const deleteMapping = useDeleteMapping();
  const setActiveMapping = useSetActiveMapping();
  const saveSectionMappings = useSaveSectionMappings();

  const [localMappings, setLocalMappings] = useState<Record<string, Record<string, string[]>>>({});
  
  useEffect(() => {
    if (sectionMappings && sections) {
      const mappingsObj: Record<string, Record<string, string[]>> = {};
      sections.forEach(section => {
        mappingsObj[section.slug] = {};
      });
      sectionMappings.forEach(m => {
        if (!mappingsObj[m.sectionSlug]) {
          mappingsObj[m.sectionSlug] = {};
        }
        mappingsObj[m.sectionSlug][m.lensSlug] = m.indices || [];
      });
      setLocalMappings(mappingsObj);
    }
  }, [sectionMappings, sections]);

  const handleCreateMapping = async () => {
    if (!newMappingName.trim()) return;
    await createMapping.mutateAsync({
      name: newMappingName,
      description: newMappingDescription || null,
      isActive: false,
    });
    setNewMappingName("");
    setNewMappingDescription("");
    setShowCreateDialog(false);
  };

  const toggleLensForSection = (sectionSlug: string, lensSlug: string) => {
    setLocalMappings(prev => {
      const sectionData = prev[sectionSlug] || {};
      if (sectionData[lensSlug]) {
        const { [lensSlug]: _, ...rest } = sectionData;
        return { ...prev, [sectionSlug]: rest };
      } else {
        return { ...prev, [sectionSlug]: { ...sectionData, [lensSlug]: [] } };
      }
    });
  };

  const toggleIndexForSection = (sectionSlug: string, lensSlug: string, index: string) => {
    setLocalMappings(prev => {
      const sectionData = prev[sectionSlug] || {};
      const currentIndices = sectionData[lensSlug] || [];
      if (currentIndices.includes(index)) {
        return {
          ...prev,
          [sectionSlug]: {
            ...sectionData,
            [lensSlug]: currentIndices.filter(i => i !== index)
          }
        };
      } else {
        return {
          ...prev,
          [sectionSlug]: {
            ...sectionData,
            [lensSlug]: [...currentIndices, index]
          }
        };
      }
    });
  };

  const handleSaveMappings = async () => {
    if (!selectedMappingId) return;
    
    const mappingsToSave: Omit<SectionLensMapping, "id" | "mappingId">[] = [];
    
    Object.entries(localMappings).forEach(([sectionSlug, lensData]) => {
      Object.entries(lensData).forEach(([lensSlug, indices]) => {
        mappingsToSave.push({
          sectionSlug,
          lensSlug,
          indices: indices.length > 0 ? indices : null,
        });
      });
    });
    
    await saveSectionMappings.mutateAsync({
      mappingId: selectedMappingId,
      mappings: mappingsToSave,
    });
  };

  const selectedMapping = mappings?.find(m => m.id === selectedMappingId);

  if (!user?.isAdmin) {
    return (
      <PageLayout title="Inquiry Mapping">
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Only administrators can access this page.
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Inquiry Mapping">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Mapping Templates
              </CardTitle>
              <CardDescription>
                Create templates that define how AI analyzes each section
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => setShowCreateDialog(true)} 
                className="w-full mb-4"
                data-testid="button-create-mapping"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Mapping
              </Button>
              
              <div className="space-y-2">
                {(mappings || []).map(mapping => (
                  <div 
                    key={mapping.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedMappingId === mapping.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                    }`}
                    onClick={() => setSelectedMappingId(mapping.id)}
                    data-testid={`card-mapping-${mapping.id}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {activeMapping?.id === mapping.id ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <Circle className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="font-medium">{mapping.name}</span>
                      </div>
                      {activeMapping?.id === mapping.id && (
                        <Badge variant="secondary" className="text-xs">Active</Badge>
                      )}
                    </div>
                    {mapping.description && (
                      <p className="text-xs text-muted-foreground mt-1 ml-6">{mapping.description}</p>
                    )}
                  </div>
                ))}
                
                {(!mappings || mappings.length === 0) && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No mappings yet. Create one to get started.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-2">
          {selectedMapping ? (
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Settings2 className="h-5 w-5" />
                      {selectedMapping.name}
                    </CardTitle>
                    <CardDescription>
                      Configure which lenses and indices apply to each section
                    </CardDescription>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {activeMapping?.id !== selectedMapping.id && (
                      <Button 
                        variant="outline"
                        onClick={() => setActiveMapping.mutate(selectedMapping.id)}
                        disabled={setActiveMapping.isPending}
                        data-testid="button-activate-mapping"
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Activate
                      </Button>
                    )}
                    <Button 
                      onClick={handleSaveMappings}
                      disabled={saveSectionMappings.isPending}
                      data-testid="button-save-mappings"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {saveSectionMappings.isPending ? "Saving..." : "Save"}
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="icon"
                      onClick={() => {
                        if (confirm("Delete this mapping?")) {
                          deleteMapping.mutate(selectedMapping.id);
                          setSelectedMappingId(null);
                        }
                      }}
                      data-testid="button-delete-mapping"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] pr-4">
                  <Accordion type="multiple" className="w-full">
                    {(sections || []).map(section => (
                      <AccordionItem key={section.id} value={section.slug}>
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{section.title}</span>
                            <Badge variant="outline" className="text-xs">
                              {Object.keys(localMappings[section.slug] || {}).length} lenses
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-4 pt-2">
                            {(lenses || []).map(lens => {
                              const isLensSelected = !!(localMappings[section.slug]?.[lens.slug]);
                              const selectedIndices = localMappings[section.slug]?.[lens.slug] || [];
                              
                              return (
                                <div key={lens.id} className="border rounded-lg p-3">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Badge
                                      variant={isLensSelected ? "default" : "outline"}
                                      className="cursor-pointer"
                                      onClick={() => toggleLensForSection(section.slug, lens.slug)}
                                      data-testid={`badge-lens-${section.slug}-${lens.slug}`}
                                    >
                                      {lens.label}
                                    </Badge>
                                  </div>
                                  
                                  {isLensSelected && lens.indices && lens.indices.length > 0 && (
                                    <div className="ml-4 flex flex-wrap gap-1">
                                      {lens.indices.map((indexItem, i) => (
                                        <Badge
                                          key={i}
                                          variant={selectedIndices.includes(indexItem) ? "secondary" : "outline"}
                                          className="cursor-pointer text-xs"
                                          onClick={() => toggleIndexForSection(section.slug, lens.slug, indexItem)}
                                          data-testid={`badge-index-${section.slug}-${lens.slug}-${i}`}
                                        >
                                          {indexItem}
                                        </Badge>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </ScrollArea>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-16 text-center">
                <Map className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Select a Mapping</h3>
                <p className="text-muted-foreground">
                  Choose a mapping template from the left to configure which lenses and indices apply to each report section.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Mapping</DialogTitle>
            <DialogDescription>
              Create a template that defines how AI should analyze each report section
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label htmlFor="mapping-name">Name</Label>
              <Input
                id="mapping-name"
                value={newMappingName}
                onChange={(e) => setNewMappingName(e.target.value)}
                placeholder="e.g., Human-Wildlife Conflict Inquiry"
                data-testid="input-mapping-name"
              />
            </div>
            <div>
              <Label htmlFor="mapping-description">Description (optional)</Label>
              <Textarea
                id="mapping-description"
                value={newMappingDescription}
                onChange={(e) => setNewMappingDescription(e.target.value)}
                placeholder="Describe the purpose of this mapping..."
                data-testid="textarea-mapping-description"
              />
            </div>
            <Button 
              onClick={handleCreateMapping}
              disabled={!newMappingName.trim() || createMapping.isPending}
              className="w-full"
              data-testid="button-confirm-create-mapping"
            >
              {createMapping.isPending ? "Creating..." : "Create Mapping"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}

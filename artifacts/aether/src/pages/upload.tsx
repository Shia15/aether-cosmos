import { useState, useRef } from "react";
import { useListDocuments, useIngestDocument, useDeleteDocument } from "@workspace/api-client-react";
import { Upload, FileText, Trash2, Database, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { getListDocumentsQueryKey } from "@workspace/api-client-react";

export default function UploadView() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: documents, isLoading } = useListDocuments();
  const ingestDoc = useIngestDocument();
  const deleteDoc = useDeleteDocument();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const handleIngest = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!title || !content) {
      toast({
        title: "Incomplete data",
        description: "Please provide both title and content.",
        variant: "destructive"
      });
      return;
    }

    try {
      await ingestDoc.mutateAsync(
        { data: { title, content } },
        {
          onSuccess: () => {
            setTitle("");
            setContent("");
            queryClient.invalidateQueries({ queryKey: getListDocumentsQueryKey() });
            toast({
              title: "Ingestion Complete",
              description: "Document mapped into the knowledge graph.",
              className: "bg-primary/10 border-primary text-primary font-mono",
            });
          }
        }
      );
    } catch (err) {
      toast({
        title: "Ingestion Failed",
        description: "An error occurred during mapping.",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc.mutateAsync(
        { id },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListDocumentsQueryKey() });
            toast({
              title: "Document Purged",
              description: "Successfully removed from graph topology.",
              className: "font-mono"
            });
          }
        }
      );
    } catch (err) {
      toast({
        title: "Purge Failed",
        description: "Failed to delete document.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto w-full space-y-12">
      <header className="space-y-2">
        <h1 className="text-4xl font-serif tracking-tight text-foreground flex items-center gap-3">
          <Database className="w-8 h-8 text-primary" />
          Data Ingestion
        </h1>
        <p className="font-mono text-sm text-muted-foreground max-w-2xl">
          Feed raw text or scientific papers into AETHER. The system will extract concepts, compute assertions, and weave them into the global topology.
        </p>
      </header>

      <div className="grid md:grid-cols-5 gap-8">
        <div className="md:col-span-3 space-y-6">
          <Card className="p-6 bg-card/50 border-white/5 shadow-2xl rounded-xl">
            <form onSubmit={handleIngest} className="space-y-4">
              <div className="space-y-2">
                <label className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Document Title</label>
                <Input 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Quantum Decoherence in Biological Systems" 
                  className="bg-black/50 border-white/10 font-serif text-lg focus-visible:ring-primary h-12"
                />
              </div>
              <div className="space-y-2">
                <label className="font-mono text-xs uppercase tracking-widest text-muted-foreground flex justify-between">
                  <span>Raw Text Content</span>
                  <span className="text-primary/50">{content.length} chars</span>
                </label>
                <div 
                  className={`relative rounded-md border transition-all duration-300 ${
                    isDragging ? 'border-primary bg-primary/5' : 'border-white/10 bg-black/50'
                  }`}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    const file = e.dataTransfer.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (e) => {
                        const text = e.target?.result;
                        if (typeof text === 'string') setContent(text);
                        if (!title) setTitle(file.name.replace(/\.[^/.]+$/, ""));
                      };
                      reader.readAsText(file);
                    }
                  }}
                >
                  <Textarea 
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Paste abstract or full text here... or drag & drop a .txt file" 
                    className="min-h-[300px] bg-transparent border-0 resize-none font-mono text-sm leading-relaxed p-4 focus-visible:ring-0 placeholder:font-serif placeholder:italic"
                  />
                  {!content && (
                    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center opacity-30">
                      <Upload className="w-10 h-10 mb-2" />
                      <span className="font-serif italic text-lg">Awaiting input stream</span>
                    </div>
                  )}
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-12 font-mono tracking-widest uppercase bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={ingestDoc.isPending}
              >
                {ingestDoc.isPending ? "Ingesting..." : "Commence Mapping"}
              </Button>
            </form>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="flex items-center gap-2 border-b border-border pb-2">
            <ActivitySquare className="w-4 h-4 text-accent" />
            <h2 className="font-mono text-sm uppercase tracking-widest text-foreground">Archive</h2>
          </div>
          
          <div className="space-y-3">
            {isLoading ? (
              [1,2,3].map(i => (
                <Card key={i} className="p-4 bg-card/30 border-white/5 animate-pulse h-24" />
              ))
            ) : documents?.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-white/10 rounded-lg">
                <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="font-serif italic text-muted-foreground">Archive is empty.</p>
              </div>
            ) : (
              documents?.map(doc => (
                <Card key={doc.id} className="p-4 bg-card/30 border-white/5 hover:border-white/10 transition-colors group">
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <h3 className="font-serif text-sm font-medium line-clamp-2 leading-tight">{doc.title}</h3>
                      <div className="flex items-center gap-3 text-xs font-mono text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          {doc.conceptCount} concepts
                        </span>
                        <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleDelete(doc.id)}
                      disabled={deleteDoc.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Quick fallback icon if needed
function ActivitySquare(props: any) {
  return <Database {...props} />;
}

import { Sidebar } from "./Sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PageLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function PageLayout({ children, title, description, action }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <main className="flex-1 md:ml-64 flex flex-col min-h-screen transition-all duration-300">
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border px-8 py-6 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground tracking-tight">{title}</h1>
            {description && <p className="text-muted-foreground mt-2 font-sans">{description}</p>}
          </div>
          {action && <div>{action}</div>}
        </header>
        
        <ScrollArea className="flex-1">
          <div className="p-8 max-w-6xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </ScrollArea>
      </main>
    </div>
  );
}

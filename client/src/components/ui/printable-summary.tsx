import { Button } from "@/components/ui/button";
import { Printer, Download } from "lucide-react";
import { useRef } from "react";

interface PrintableSummaryProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  generatedAt?: string;
}

export function PrintableSummary({ title, subtitle, children, generatedAt }: PrintableSummaryProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (!contentRef.current) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to print this content');
      return;
    }

    const styles = `
      <style>
        @media print {
          body { 
            font-family: 'Georgia', serif;
            line-height: 1.6;
            color: #1a1a1a;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px;
          }
          h1 { 
            font-size: 24px; 
            margin-bottom: 8px;
            color: #1a1a1a;
          }
          h2 { 
            font-size: 18px; 
            margin-top: 24px;
            margin-bottom: 12px;
            color: #333;
            border-bottom: 1px solid #ddd;
            padding-bottom: 4px;
          }
          h3 {
            font-size: 16px;
            margin-top: 16px;
            margin-bottom: 8px;
            color: #444;
          }
          .subtitle {
            font-size: 14px;
            color: #666;
            margin-bottom: 24px;
          }
          .generated-at {
            font-size: 12px;
            color: #888;
            margin-bottom: 24px;
          }
          p { margin-bottom: 12px; }
          ul, ol { 
            margin-bottom: 12px;
            padding-left: 24px;
          }
          li { margin-bottom: 6px; }
          blockquote {
            border-left: 3px solid #666;
            padding-left: 16px;
            margin: 16px 0;
            font-style: italic;
            color: #555;
          }
          .theme-tag {
            display: inline-block;
            background: #f0f0f0;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 12px;
            margin-right: 8px;
            margin-bottom: 4px;
          }
          .section {
            margin-bottom: 24px;
          }
          @page {
            margin: 1in;
          }
        }
        body { 
          font-family: 'Georgia', serif;
          line-height: 1.6;
          color: #1a1a1a;
          max-width: 800px;
          margin: 0 auto;
          padding: 40px;
        }
        h1 { 
          font-size: 24px; 
          margin-bottom: 8px;
        }
        h2 { 
          font-size: 18px; 
          margin-top: 24px;
          margin-bottom: 12px;
          border-bottom: 1px solid #ddd;
          padding-bottom: 4px;
        }
        h3 {
          font-size: 16px;
          margin-top: 16px;
          margin-bottom: 8px;
        }
        .subtitle {
          font-size: 14px;
          color: #666;
          margin-bottom: 24px;
        }
        .generated-at {
          font-size: 12px;
          color: #888;
          margin-bottom: 24px;
        }
        p { margin-bottom: 12px; }
        ul, ol { 
          margin-bottom: 12px;
          padding-left: 24px;
        }
        li { margin-bottom: 6px; }
        blockquote {
          border-left: 3px solid #666;
          padding-left: 16px;
          margin: 16px 0;
          font-style: italic;
          color: #555;
        }
      </style>
    `;

    const date = generatedAt ? new Date(generatedAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) : new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          ${styles}
        </head>
        <body>
          <h1>${title}</h1>
          ${subtitle ? `<div class="subtitle">${subtitle}</div>` : ''}
          <div class="generated-at">Generated: ${date}</div>
          ${contentRef.current.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    
    // Wait for content to load then print
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  return (
    <div>
      <div className="flex justify-end gap-2 mb-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handlePrint}
          data-testid="button-print-summary"
        >
          <Printer className="h-4 w-4 mr-2" />
          Print / Save PDF
        </Button>
      </div>
      <div ref={contentRef}>
        {children}
      </div>
    </div>
  );
}

interface SummarySection {
  title: string;
  content: React.ReactNode;
}

export function formatSummaryForPrint(sections: SummarySection[]): React.ReactNode {
  return (
    <>
      {sections.map((section, index) => (
        <div key={index} className="section">
          <h2>{section.title}</h2>
          {section.content}
        </div>
      ))}
    </>
  );
}

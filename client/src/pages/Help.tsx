import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  HelpCircle, BookOpen, Users, Calendar, FileText, Brain, 
  Lock, Settings, Search, ChevronDown, ChevronUp,
  MessageSquare, Lightbulb, Shield
} from "lucide-react";
import { Input } from "@/components/ui/input";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQItem[] = [
  {
    category: "Getting Started",
    question: "How do I join a cohort?",
    answer: "To join a cohort, you need a magic invite code from your cohort administrator. Go to the registration page, enter the invite code along with your chosen username, full name, and password. Once registered, you'll have access to all cohort features."
  },
  {
    category: "Getting Started",
    question: "What should I do first after logging in?",
    answer: "Start by visiting your 'My Inquiry' page to set up your research question and learning pathway. Then add your first weekly reflection. This establishes your personal inquiry journey that you'll build on throughout the cohort."
  },
  {
    category: "Getting Started",
    question: "How do I change my password?",
    answer: "Go to your Account page (click your name in the sidebar) and scroll down to the Security section. You can change your password there by entering your current password and choosing a new one."
  },
  {
    category: "My Inquiry",
    question: "What should I write in my reflections?",
    answer: "Weekly reflections should capture your learning journey: What did you discover? What questions emerged? What connections did you make? What challenges did you face? Regular reflections help you synthesize your thinking and prepare for the final report."
  },
  {
    category: "My Inquiry",
    question: "Who can see my reflections?",
    answer: "By default, reflections are private (only you can see them). When adding a reflection, you can change the visibility to 'Group' (your inquiry group members) or 'Cohort' (everyone in the cohort). You can share when you're ready."
  },
  {
    category: "Resources",
    question: "What kinds of resources should I share?",
    answer: "Share anything that supports the cohort's learning: articles, research papers, videos, podcasts, tools, frameworks, or any other materials you've found helpful. Add annotations to explain why each resource is valuable."
  },
  {
    category: "Resources",
    question: "How do I organize resources with tags?",
    answer: "When adding a resource, you can add comma-separated tags like 'equity, methodology, case study'. Tags help everyone filter and find relevant resources. Try to use consistent tags across the cohort."
  },
  {
    category: "Meetings",
    question: "How do I add a meeting?",
    answer: "Only administrators can create new meetings. If you're an admin, go to the Meetings page and click 'Add Meeting' to set the date, title, agenda, and Zoom link. All cohort members can then view and access meeting details."
  },
  {
    category: "Meetings",
    question: "Can I add notes to meetings?",
    answer: "Yes! Administrators can add notes, action items, and updates to meetings. This helps keep track of decisions and follow-up tasks from each gathering."
  },
  {
    category: "Report Builder",
    question: "How does collaborative report writing work?",
    answer: "The Report Builder has structured sections (customized by your admin). Each member can contribute posts to any section. All contributions are saved with version history, so nothing is lost. You can react to others' posts and add comments."
  },
  {
    category: "Report Builder",
    question: "What are justice lens tags?",
    answer: "Justice lens tags help categorize contributions by ethical perspectives: Who Benefits?, Labor & Work, Access & Equity, Environmental Impact, etc. These tags help ensure your report addresses multiple dimensions of justice and ethics."
  },
  {
    category: "Report Builder",
    question: "How do I use AI synthesis for a section?",
    answer: "Administrators can click 'AI Synthesis' on any report section to generate an AI-powered summary of all contributions. The synthesis includes evidence-backed citations linking back to original posts."
  },
  {
    category: "AI Features",
    question: "What does the AI analyze?",
    answer: "The AI analyzes content you've created and shared: reflections, resources, and report contributions. It identifies themes, patterns, and connections across your work and generates synthesized summaries."
  },
  {
    category: "AI Features",
    question: "Can I opt out of AI analysis?",
    answer: "Yes. Go to your Account page and find the 'AI Privacy Settings' section. You can toggle off AI indexing for new content. Note that previously indexed content may still be included in existing analyses."
  },
  {
    category: "AI Features",
    question: "Are AI insights accurate?",
    answer: "AI insights are meant to help synthesize and surface patterns, but they may not capture every nuance. Always review AI-generated content critically and verify important claims against original sources."
  },
  {
    category: "Privacy",
    question: "What's the difference between Private, Group, and Cohort visibility?",
    answer: "Private: Only you can see it. Group: Members of your inquiry group can see it. Cohort: All cohort members can see it. Choose based on how ready you are to share your thinking."
  },
  {
    category: "Privacy",
    question: "Can administrators see my private content?",
    answer: "No, administrators cannot see content marked as 'Private'. Private content is only visible to you. However, administrators can see Group and Cohort-visible content."
  },
  {
    category: "Troubleshooting",
    question: "I forgot my password. What should I do?",
    answer: "Contact your cohort administrator. They can reset your password from the Settings page, and you'll receive a temporary password to log in and set a new one."
  },
  {
    category: "Troubleshooting",
    question: "The page isn't loading correctly. What should I do?",
    answer: "Try refreshing the page first. If that doesn't work, try clearing your browser cache or using a different browser. If problems persist, contact your cohort administrator."
  }
];

function FAQAccordion({ item }: { item: FAQItem }) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="border-b last:border-0">
      <button 
        className="w-full py-4 flex items-center justify-between text-left hover:bg-muted/50 px-2 rounded"
        onClick={() => setIsOpen(!isOpen)}
        data-testid={`faq-toggle-${item.question.slice(0, 20).replace(/\s/g, '-')}`}
      >
        <span className="font-medium pr-4">{item.question}</span>
        {isOpen ? <ChevronUp className="h-4 w-4 shrink-0" /> : <ChevronDown className="h-4 w-4 shrink-0" />}
      </button>
      {isOpen && (
        <div className="pb-4 px-2 text-muted-foreground">
          {item.answer}
        </div>
      )}
    </div>
  );
}

export default function Help() {
  const [searchTerm, setSearchTerm] = useState("");
  
  const categories = Array.from(new Set(faqs.map(f => f.category)));
  
  const filteredFaqs = searchTerm 
    ? faqs.filter(f => 
        f.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.answer.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : faqs;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Getting Started": return <Lightbulb className="h-5 w-5 text-yellow-500" />;
      case "My Inquiry": return <BookOpen className="h-5 w-5 text-blue-500" />;
      case "Resources": return <Search className="h-5 w-5 text-green-500" />;
      case "Meetings": return <Calendar className="h-5 w-5 text-purple-500" />;
      case "Report Builder": return <FileText className="h-5 w-5 text-orange-500" />;
      case "AI Features": return <Brain className="h-5 w-5 text-pink-500" />;
      case "Privacy": return <Shield className="h-5 w-5 text-slate-500" />;
      case "Troubleshooting": return <Settings className="h-5 w-5 text-red-500" />;
      default: return <HelpCircle className="h-5 w-5" />;
    }
  };

  return (
    <PageLayout title="Help & FAQ">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-primary" />
              How can we help?
            </CardTitle>
            <CardDescription>
              Search for answers or browse by category below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search for help..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-help-search"
              />
            </div>
          </CardContent>
        </Card>

        {searchTerm ? (
          <Card>
            <CardHeader>
              <CardTitle>Search Results</CardTitle>
              <CardDescription>
                {filteredFaqs.length} result{filteredFaqs.length !== 1 ? 's' : ''} found
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredFaqs.length > 0 ? (
                filteredFaqs.map((faq, i) => (
                  <FAQAccordion key={i} item={faq} />
                ))
              ) : (
                <p className="text-muted-foreground py-4">
                  No results found. Try different search terms or browse by category.
                </p>
              )}
            </CardContent>
          </Card>
        ) : (
          categories.map(category => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getCategoryIcon(category)}
                  {category}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {faqs.filter(f => f.category === category).map((faq, i) => (
                  <FAQAccordion key={i} item={faq} />
                ))}
              </CardContent>
            </Card>
          ))
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-500" />
              Still need help?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              If you couldn't find the answer you're looking for, please contact your cohort administrator 
              for assistance. They can help with account issues, technical problems, and platform questions.
            </p>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}

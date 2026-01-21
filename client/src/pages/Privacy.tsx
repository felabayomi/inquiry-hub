import { PageLayout } from "@/components/layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Database, Eye, Lock, Users, Bot, Trash2, Mail } from "lucide-react";

export default function Privacy() {
  return (
    <PageLayout title="Privacy Policy">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">
              Last updated: January 2026
            </p>
            <p className="mt-4 text-muted-foreground">
              This Privacy Policy describes how Inquiry Hub ("we", "us", or "our") collects, uses, 
              and protects your information when you use our platform.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-500" />
              Information We Collect
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Account Information</h4>
              <p className="text-sm text-muted-foreground">
                When you create an account, we collect your username, full name, and password (stored securely using 
                industry-standard encryption). We do not collect email addresses unless you choose to provide one.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Content You Create</h4>
              <p className="text-sm text-muted-foreground">
                We store the content you create on the platform, including inquiry questions, reflections, 
                resources, meeting notes, and report contributions. This content is stored in our secure database 
                and is subject to the visibility settings you choose.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Usage Data</h4>
              <p className="text-sm text-muted-foreground">
                We collect basic usage data such as when you log in and which features you use. This helps us 
                improve the platform and troubleshoot issues.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-green-500" />
              How We Use Your Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-muted-foreground">
              <li>• To provide and maintain the Inquiry Hub platform</li>
              <li>• To enable collaboration features with other cohort members</li>
              <li>• To generate AI-powered insights and summaries (with your permission)</li>
              <li>• To improve our platform and develop new features</li>
              <li>• To communicate important updates about the service</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-purple-500" />
              Your Privacy Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Inquiry Hub gives you control over who can see your content:
            </p>
            <div className="space-y-3">
              <div className="flex gap-3">
                <Lock className="h-4 w-4 mt-1 shrink-0" />
                <div>
                  <span className="font-medium">Private:</span>
                  <span className="text-sm text-muted-foreground ml-2">Only you can see this content</span>
                </div>
              </div>
              <div className="flex gap-3">
                <Users className="h-4 w-4 mt-1 shrink-0" />
                <div>
                  <span className="font-medium">Group:</span>
                  <span className="text-sm text-muted-foreground ml-2">Visible to members of your inquiry group</span>
                </div>
              </div>
              <div className="flex gap-3">
                <Eye className="h-4 w-4 mt-1 shrink-0" />
                <div>
                  <span className="font-medium">Cohort:</span>
                  <span className="text-sm text-muted-foreground ml-2">Visible to all cohort members</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-pink-500" />
              AI Features & Your Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Our AI features use your content to generate insights and summaries. Here's how we handle this:
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li>• AI analysis respects your visibility settings - private content stays private</li>
              <li>• You can opt out of AI indexing for any content in your Account settings</li>
              <li>• AI-generated insights are based only on content you and your cohort have shared</li>
              <li>• We use OpenAI's API for AI features, subject to their privacy policy</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-slate-500" />
              Data Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              We take the security of your data seriously:
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Passwords are encrypted using industry-standard hashing algorithms</li>
              <li>• All data is transmitted over secure HTTPS connections</li>
              <li>• Our database is hosted on secure cloud infrastructure</li>
              <li>• Session data is stored securely and expires after 30 days of inactivity</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-500" />
              Data Retention & Deletion
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Your content is retained as long as your account is active. If you wish to delete your account 
              or specific content, please contact your cohort administrator.
            </p>
            <p className="text-muted-foreground">
              When content is deleted, it is removed from our active database. Backup copies may be retained 
              for a limited period for disaster recovery purposes.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-500" />
              Contact Us
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              If you have questions about this Privacy Policy or how we handle your data, please contact 
              your cohort administrator or the platform support team.
            </p>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}

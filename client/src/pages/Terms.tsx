import { PageLayout } from "@/components/layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  FileText, CheckCircle, XCircle, Users, Shield, 
  AlertTriangle, Scale, RefreshCw 
} from "lucide-react";

export default function Terms() {
  return (
    <PageLayout title="Terms of Use">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">
              Last updated: January 2026
            </p>
            <p className="mt-4 text-muted-foreground">
              By using Inquiry Hub, you agree to these Terms of Use. Please read them carefully before 
              using the platform.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-500" />
              Acceptance of Terms
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              By accessing or using Inquiry Hub, you agree to be bound by these Terms of Use and our Privacy Policy. 
              If you do not agree to these terms, please do not use the platform.
            </p>
            <p className="text-muted-foreground">
              These terms apply to all users, including cohort members, facilitators, and administrators.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-500" />
              Account Responsibilities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              When you create an account on Inquiry Hub, you agree to:
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Provide accurate information when registering</li>
              <li>• Keep your login credentials secure and confidential</li>
              <li>• Notify administrators immediately if you suspect unauthorized access to your account</li>
              <li>• Not share your account with others or use another person's account</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Acceptable Use
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              You agree to use Inquiry Hub for its intended purpose of collaborative research and learning. 
              Acceptable uses include:
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Documenting your inquiry journey and reflections</li>
              <li>• Sharing resources that support the cohort's learning</li>
              <li>• Collaborating on meeting notes and action items</li>
              <li>• Contributing to shared reports and discussions</li>
              <li>• Using AI features to synthesize and analyze your work</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              Prohibited Conduct
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              You agree NOT to:
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Post content that is offensive, harassing, or discriminatory</li>
              <li>• Share copyrighted material without proper attribution or permission</li>
              <li>• Attempt to access other users' private content without permission</li>
              <li>• Use the platform for commercial purposes unrelated to your cohort</li>
              <li>• Attempt to hack, disrupt, or compromise the platform's security</li>
              <li>• Share your magic invite code with unauthorized individuals</li>
              <li>• Misrepresent your identity or affiliation</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-500" />
              Content Ownership
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              <strong>Your Content:</strong> You retain ownership of the content you create on Inquiry Hub, 
              including reflections, resources, and report contributions. By posting content, you grant 
              Inquiry Hub a license to store and display your content according to your visibility settings.
            </p>
            <p className="text-muted-foreground">
              <strong>Shared Content:</strong> Content marked as "group" or "cohort" visible may be viewed 
              and built upon by other members as part of the collaborative nature of the platform.
            </p>
            <p className="text-muted-foreground">
              <strong>AI Processing:</strong> Content you share may be processed by AI features to generate 
              insights. You can control this in your account settings.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Disclaimers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Inquiry Hub is provided "as is" without warranties of any kind. We do not guarantee:
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Uninterrupted or error-free service</li>
              <li>• That AI-generated insights are complete or accurate</li>
              <li>• That the platform will meet all your specific requirements</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              We recommend regularly backing up important content and not relying solely on the platform 
              for critical data storage.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-slate-500" />
              Limitation of Liability
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              To the maximum extent permitted by law, Inquiry Hub and its operators shall not be liable 
              for any indirect, incidental, special, or consequential damages arising from your use of 
              the platform, including loss of data or content.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-blue-500" />
              Changes to Terms
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              We may update these Terms of Use from time to time. Changes will be posted on this page 
              with an updated revision date. Continued use of the platform after changes constitutes 
              acceptance of the new terms.
            </p>
            <p className="text-muted-foreground">
              For significant changes, we will make reasonable efforts to notify users through the platform.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">
              If you have questions about these Terms of Use, please contact your cohort administrator.
            </p>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Copy, 
  Eye, 
  Sparkles,
  RefreshCw,
  Search
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { SecurityIssue } from "@shared/schema";
import type { FixPrompt } from "../../../types/alfr3d";

interface SecurityStatus {
  isScanning: boolean;
  lastScan: string;
  issuesCount: number;
}

export default function Alfr3dDashboard() {
  const [generatedPrompts, setGeneratedPrompts] = useState<Record<string, FixPrompt>>({});
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch security issues
  const { data: issues = [], isLoading: issuesLoading } = useQuery<SecurityIssue[]>({
    queryKey: ['/api/alfr3d/issues'],
  });

  // Fetch security status
  const { data: status } = useQuery<SecurityStatus>({
    queryKey: ['/api/alfr3d/status'],
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Generate fix prompt mutation - Individual issue processing
  const generateFixMutation = useMutation({
    mutationFn: async (issueId: string) => {
      console.log(`[ALFR3D Frontend] Generating fix prompt for issue: ${issueId}`);
      
      const response = await apiRequest(`/api/alfr3d/issues/${issueId}/fix-prompt`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate fix prompt');
      }
      
      return response.json();
    },
    onSuccess: (data, issueId) => {
      console.log(`[ALFR3D Frontend] ✓ Fix prompt generated for issue: ${issueId}`);
      
      // Store the generated prompt for this specific issue
      setGeneratedPrompts(prev => ({
        ...prev,
        [issueId]: data.fixPrompt
      }));
      
      // Invalidate issues to refresh the data
      queryClient.invalidateQueries({ queryKey: ['/api/alfr3d/issues'] });
      
      toast({
        title: "AI Fix Prompt Generated",
        description: "The fix prompt has been generated successfully. You can now view or copy it.",
      });
    },
    onError: (error) => {
      console.error('[ALFR3D Frontend] Failed to generate fix prompt:', error);
      toast({
        title: "Failed to Generate Fix Prompt",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Start security scan mutation
  const scanMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/alfr3d/scan');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/alfr3d/status'] });
      queryClient.invalidateQueries({ queryKey: ['/api/alfr3d/issues'] });
      toast({
        title: "Security Scan Started",
        description: "The security scan has been initiated.",
      });
    },
  });

  // Copy prompt to clipboard
  const copyPromptToClipboard = async (prompt: FixPrompt, issueTitle: string) => {
    try {
      const formattedPrompt = `# AI Fix Prompt: ${issueTitle}

## Analysis
${prompt.analysis}

## Steps to Fix
${prompt.steps.map((step, index) => `${index + 1}. ${step}`).join('\n')}

## Risk Level: ${prompt.riskLevel.toUpperCase()}
## Estimated Time: ${prompt.estimatedTime}

## Prerequisites
${prompt.prerequisites.map(p => `• ${p}`).join('\n')}

## Testing Approach
${prompt.testingApproach}
`;

      await navigator.clipboard.writeText(formattedPrompt);
      toast({
        title: "Copied to Clipboard",
        description: "The fix prompt has been copied to your clipboard.",
      });
    } catch (error) {
      toast({
        title: "Failed to Copy",
        description: "Could not copy to clipboard. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:text-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': 
      case 'high': 
        return <AlertTriangle className="w-3 h-3" />;
      case 'medium': 
        return <Clock className="w-3 h-3" />;
      case 'low': 
        return <CheckCircle className="w-3 h-3" />;
      default: 
        return <Shield className="w-3 h-3" />;
    }
  };

  if (issuesLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6" />
          <h1 className="text-2xl font-bold">ALFR3D Security Dashboard</h1>
        </div>
        <div className="text-center p-8">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading security analysis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          <h1 className="text-xl font-bold">ALFR3D Security Dashboard</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs text-gray-500">
            Issues: {status?.issuesCount || 0} | Last Scan: {status?.lastScan ? new Date(status.lastScan).toLocaleTimeString() : 'Never'}
          </div>
          <Button
            onClick={() => scanMutation.mutate()}
            disabled={scanMutation.isPending || status?.isScanning}
            size="sm"
            variant="outline"
          >
            {scanMutation.isPending || status?.isScanning ? (
              <RefreshCw className="w-3 h-3 animate-spin mr-1" />
            ) : (
              <Search className="w-3 h-3 mr-1" />
            )}
            {status?.isScanning ? 'Scanning...' : 'Scan'}
          </Button>
        </div>
      </div>

      {/* Compact Issues Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Security Issues</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {issues.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <Shield className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No security issues found. Run a scan to analyze your application.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b bg-gray-50 dark:bg-gray-800">
                    <th className="text-left p-2 font-medium">Type</th>
                    <th className="text-left p-2 font-medium">Severity</th>
                    <th className="text-left p-2 font-medium">Title</th>
                    <th className="text-left p-2 font-medium">File</th>
                    <th className="text-left p-2 font-medium">Line</th>
                    <th className="text-left p-2 font-medium">Status</th>
                    <th className="text-left p-2 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {issues.map((issue) => {
                    const hasGeneratedPrompt = generatedPrompts[issue.id] || issue.fixPrompt;
                    
                    return (
                      <tr key={issue.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="p-2">
                          <Badge variant="secondary" className="text-xs px-1 py-0">
                            {issue.type}
                          </Badge>
                        </td>
                        <td className="p-2">
                          <Badge className={`text-xs px-1 py-0 ${getSeverityColor(issue.severity)}`}>
                            <span className="flex items-center gap-1">
                              {getSeverityIcon(issue.severity)}
                              {issue.severity}
                            </span>
                          </Badge>
                        </td>
                        <td className="p-2 max-w-40">
                          <div className="truncate" title={issue.title}>
                            {issue.title}
                          </div>
                        </td>
                        <td className="p-2 max-w-32">
                          <div className="truncate text-gray-600 dark:text-gray-400" title={issue.file}>
                            {issue.file}
                          </div>
                        </td>
                        <td className="p-2">
                          <span className="text-gray-600 dark:text-gray-400">
                            {issue.line || '-'}
                          </span>
                        </td>
                        <td className="p-2">
                          <Badge 
                            variant={issue.status === 'resolved' ? 'default' : 'secondary'} 
                            className="text-xs px-1 py-0"
                          >
                            {issue.status}
                          </Badge>
                        </td>
                        <td className="p-2">
                          <div className="flex items-center gap-1">
                            {/* AI Fix Button - Individual processing */}
                            <Button
                              onClick={() => generateFixMutation.mutate(issue.id)}
                              disabled={generateFixMutation.isPending}
                              size="sm"
                              variant="outline"
                              className="text-xs h-6 px-2"
                            >
                              {generateFixMutation.isPending && generateFixMutation.variables === issue.id ? (
                                <RefreshCw className="w-3 h-3 animate-spin" />
                              ) : (
                                <>
                                  <Sparkles className="w-3 h-3 mr-1" />
                                  AI Fix
                                </>
                              )}
                            </Button>
                            
                            {/* Copy Button - Only show if prompt is generated */}
                            {hasGeneratedPrompt && (
                              <Button
                                onClick={() => copyPromptToClipboard(
                                  generatedPrompts[issue.id] || issue.fixPrompt, 
                                  issue.title
                                )}
                                size="sm"
                                variant="ghost"
                                className="text-xs h-6 px-2"
                                title="Copy prompt to clipboard"
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                            )}
                            
                            {/* View Button - Only show if prompt is generated */}
                            {hasGeneratedPrompt && (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-xs h-6 px-2"
                                    title="View fix prompt"
                                  >
                                    <Eye className="w-3 h-3" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl max-h-[80vh]">
                                  <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2">
                                      <Sparkles className="w-4 h-4" />
                                      AI Fix Prompt: {issue.title}
                                    </DialogTitle>
                                    <DialogDescription>
                                      Generated fix instructions for this security issue
                                    </DialogDescription>
                                  </DialogHeader>
                                  <ScrollArea className="max-h-96">
                                    <div className="space-y-4 pr-4">
                                      <div>
                                        <h4 className="font-medium text-sm mb-2">Analysis</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                          {(generatedPrompts[issue.id] || issue.fixPrompt)?.analysis}
                                        </p>
                                      </div>
                                      
                                      <Separator />
                                      
                                      <div>
                                        <h4 className="font-medium text-sm mb-2">Fix Steps</h4>
                                        <ol className="list-decimal list-inside space-y-1 text-sm">
                                          {((generatedPrompts[issue.id] || issue.fixPrompt)?.steps || []).map((step, index) => (
                                            <li key={index} className="text-gray-600 dark:text-gray-400">
                                              {step}
                                            </li>
                                          ))}
                                        </ol>
                                      </div>
                                      
                                      <Separator />
                                      
                                      <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                          <h4 className="font-medium mb-1">Risk Level</h4>
                                          <Badge className={getSeverityColor((generatedPrompts[issue.id] || issue.fixPrompt)?.riskLevel || 'medium')}>
                                            {((generatedPrompts[issue.id] || issue.fixPrompt)?.riskLevel || 'unknown').toUpperCase()}
                                          </Badge>
                                        </div>
                                        <div>
                                          <h4 className="font-medium mb-1">Estimated Time</h4>
                                          <p className="text-gray-600 dark:text-gray-400">
                                            {(generatedPrompts[issue.id] || issue.fixPrompt)?.estimatedTime}
                                          </p>
                                        </div>
                                      </div>
                                      
                                      <Separator />
                                      
                                      <div>
                                        <h4 className="font-medium text-sm mb-2">Prerequisites</h4>
                                        <ul className="list-disc list-inside space-y-1 text-sm">
                                          {((generatedPrompts[issue.id] || issue.fixPrompt)?.prerequisites || []).map((prereq, index) => (
                                            <li key={index} className="text-gray-600 dark:text-gray-400">
                                              {prereq}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                      
                                      <Separator />
                                      
                                      <div>
                                        <h4 className="font-medium text-sm mb-2">Testing Approach</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                          {(generatedPrompts[issue.id] || issue.fixPrompt)?.testingApproach}
                                        </p>
                                      </div>
                                    </div>
                                  </ScrollArea>
                                  <div className="flex justify-end gap-2 pt-4 border-t">
                                    <Button
                                      onClick={() => copyPromptToClipboard(
                                        generatedPrompts[issue.id] || issue.fixPrompt,
                                        issue.title
                                      )}
                                      variant="outline"
                                    >
                                      <Copy className="w-4 h-4 mr-2" />
                                      Copy Prompt
                                    </Button>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Shield, AlertTriangle, Bug, Database, Zap, RefreshCw, Eye, Check, Clock, Brain, Archive, ArchiveRestore, TrendingUp, FileText, Copy, Bot } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { SecurityIssue } from "../../../types/alfr3d";

export default function Alfr3dDashboard() {
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [selectedIssue, setSelectedIssue] = useState<SecurityIssue | null>(null);
  const [generatedPrompts, setGeneratedPrompts] = useState<Record<string, string>>({});
  const [dialogOpen, setDialogOpen] = useState<string | null>(null);
  const { toast } = useToast();

  // Only show in development
  if (import.meta.env.PROD) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-black dark:text-white">Development Only</CardTitle>
            <CardDescription>This dashboard is only available in development mode.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Fetch security issues
  const { data: issues, isLoading, refetch } = useQuery<SecurityIssue[]>({
    queryKey: ['/api/alfr3d/issues'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch scan status
  const { data: scanStatus } = useQuery<{ isScanning: boolean; lastScan: string }>({
    queryKey: ['/api/alfr3d/status'],
    refetchInterval: 5000,
  });

  // Manual scan trigger
  const scanMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/alfr3d/scan"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/alfr3d/issues'] });
      toast({
        title: "Scan Initiated",
        description: "Security scan started. Results will appear shortly.",
      });
    },
  });

  // Mark issue as reviewed
  const reviewMutation = useMutation({
    mutationFn: ({ id, reviewed }: { id: string; reviewed: boolean }) => 
      apiRequest("PATCH", `/api/alfr3d/issues/${id}`, { reviewed }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/alfr3d/issues'] });
    },
  });

  // Generate AI fix prompt
  const generateFixMutation = useMutation({
    mutationFn: ({ issueId, issue }: { issueId: string; issue: SecurityIssue }) => {
      setSelectedIssue(issue);
      return apiRequest("POST", `/api/alfr3d/issues/${issueId}/fix-prompt`);
    },
    onSuccess: (data: any, variables) => {
      const { issue } = variables;
      if (issue && data && data.fixPrompt) {
        const fixPrompt = data.fixPrompt;
        const prompt = `🔒 SECURITY FIX REQUEST

ISSUE: ${issue.title}
FILE: ${issue.file}
LINE: ${issue.line || 'N/A'}
SEVERITY: ${issue.severity.toUpperCase()}

DESCRIPTION:
${issue.description}

AI EXPERT ANALYSIS:
${fixPrompt.analysis || 'Analysis not available'}

RECOMMENDED STEPS:
${(fixPrompt.steps || []).map((step: string, i: number) => `${i + 1}. ${step}`).join('\n')}

RISK LEVEL: ${(fixPrompt.riskLevel || 'medium').toUpperCase()}
ESTIMATED TIME: ${fixPrompt.estimatedTime || 'Unknown'}

PREREQUISITES:
${(fixPrompt.prerequisites || []).map((req: string) => `• ${req}`).join('\n')}

TESTING APPROACH:
${fixPrompt.testingApproach || 'Manual verification required'}

---
Please implement this security fix following the expert recommendations above.`;
        
        setGeneratedPrompts(prev => ({
          ...prev,
          [variables.issueId]: prompt
        }));
        
        // Don't auto-open dialog, let user choose to view or copy
        toast({
          title: "✅ AI Fix Prompt Generated",
          description: "Copy and view buttons are now available. Click the green copy button to copy the prompt.",
        });
      } else {
        toast({
          title: "Error",
          description: "Invalid response format from AI expert.",
          variant: "destructive",
        });
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate AI fix prompt. Please try again.",
        variant: "destructive",
      });
    },
  });

  const copyPromptToClipboard = async (issueId: string) => {
    const prompt = generatedPrompts[issueId];
    if (!prompt) return;
    
    try {
      await navigator.clipboard.writeText(prompt);
      toast({
        title: "Copied to Clipboard",
        description: "AI fix prompt copied! You can now paste it in chat with me.",
      });
      setDialogOpen(null);
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Please manually copy the text from the dialog.",
        variant: "destructive",
      });
    }
  };

  const filteredIssues = (issues || []).filter(issue => {
    const matchesFilter = filter === "all" || issue.type === filter;
    const matchesSearch = search === "" || 
      issue.title.toLowerCase().includes(search.toLowerCase()) ||
      issue.file.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-600 text-white';
      case 'high': return 'bg-orange-600 text-white';
      case 'medium': return 'bg-yellow-600 text-white';
      case 'low': return 'bg-blue-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'security': return <Shield className="w-4 h-4" />;
      case 'routing': return <Zap className="w-4 h-4" />;
      case 'schema': return <Database className="w-4 h-4" />;
      case 'sync': return <Bug className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const stats = {
    total: issues?.length || 0,
    critical: issues?.filter(i => i.severity === 'critical').length || 0,
    high: issues?.filter(i => i.severity === 'high').length || 0,
    reviewed: issues?.filter(i => i.reviewed).length || 0,
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-black dark:text-white">
                🛡️ ALFR3D Security
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {stats.total} issues • {stats.critical} critical • {stats.high} high
              </div>
              <Button 
                onClick={() => scanMutation.mutate()}
                disabled={scanMutation.isPending || scanStatus?.isScanning}
                size="sm"
                className="bg-black text-white hover:bg-gray-900 dark:bg-white dark:text-black dark:hover:bg-gray-100"
              >
                {scanMutation.isPending || scanStatus?.isScanning ? (
                  <>
                    <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <Shield className="w-3 h-3 mr-1" />
                    Scan
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-64">
                <Input
                  placeholder="Search issues by title or file..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                  <SelectItem value="routing">Routing</SelectItem>
                  <SelectItem value="schema">Database/Schema</SelectItem>
                  <SelectItem value="sync">Frontend Sync</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Issues Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-black dark:text-white">Security Issues</CardTitle>
            <CardDescription>
              {filteredIssues.length} issue{filteredIssues.length !== 1 ? 's' : ''} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="w-6 h-6 animate-spin text-gray-500" />
                <span className="ml-2 text-gray-500">Loading issues...</span>
              </div>
            ) : filteredIssues.length === 0 ? (
              <div className="text-center py-8">
                <Shield className="w-16 h-16 mx-auto text-green-500 mb-4" />
                <p className="text-xl font-medium text-black dark:text-white mb-2">
                  {filter === "all" ? "No Issues Found" : `No ${filter} Issues`}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  {search ? "Try adjusting your search terms." : "Your code looks secure!"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="text-xs">
                      <TableHead className="w-16">Type</TableHead>
                      <TableHead className="w-16">Sev</TableHead>
                      <TableHead className="min-w-0 flex-1">Issue</TableHead>
                      <TableHead className="w-24">File</TableHead>
                      <TableHead className="w-12">Line</TableHead>
                      <TableHead className="w-16">Time</TableHead>
                      <TableHead className="w-16">Status</TableHead>
                      <TableHead className="w-24">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredIssues.map((issue) => (
                      <TableRow key={issue.id} className="text-xs">
                        <TableCell className="py-2">
                          <div className="flex items-center gap-1">
                            {getTypeIcon(issue.type)}
                            <span className="capitalize text-xs">{issue.type}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-2">
                          <Badge className={`${getSeverityColor(issue.severity)} text-xs px-1 py-0`}>
                            {issue.severity.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-2">
                          <div className="min-w-0">
                            <p className="font-medium text-black dark:text-white text-xs truncate" title={issue.title}>
                              {issue.title}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 truncate" title={issue.description}>
                              {issue.description}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-xs py-2">
                          <span className="truncate block" title={issue.file.replace(/^.*\/workspace\//, '')}>
                            {issue.file.replace(/^.*\/workspace\//, '').replace(/^.*\//, '')}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs py-2">{issue.line || '-'}</TableCell>
                        <TableCell className="text-xs py-2">
                          {new Date(issue.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </TableCell>
                        <TableCell className="py-2">
                          {issue.reviewed ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs px-1 py-0">
                              <Check className="w-2 h-2 mr-1" />
                              ✓
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 text-xs px-1 py-0">
                              <Clock className="w-2 h-2 mr-1" />
                              ⧖
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="py-2">
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => reviewMutation.mutate({ 
                                id: issue.id, 
                                reviewed: !issue.reviewed 
                              })}
                              disabled={reviewMutation.isPending}
                              className="h-6 px-2 text-xs"
                            >
                              {issue.reviewed ? (
                                <Eye className="w-3 h-3" />
                              ) : (
                                <Check className="w-3 h-3" />
                              )}
                            </Button>
                            
                            <Button
                              size="sm"
                              variant="outline"
                              className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 h-6 px-2 text-xs"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                generateFixMutation.mutate({ issueId: issue.id, issue });
                              }}
                              disabled={generateFixMutation.isPending}
                            >
                              {generateFixMutation.isPending ? (
                                <RefreshCw className="w-3 h-3 animate-spin" />
                              ) : (
                                <Bot className="w-3 h-3" />
                              )}
                            </Button>

                            {generatedPrompts[issue.id] && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => copyPromptToClipboard(issue.id)}
                                  className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200 h-6 px-2 text-xs"
                                  title="📋 Copy AI prompt"
                                >
                                  <Copy className="w-3 h-3" />
                                </Button>
                                
                                <Dialog open={dialogOpen === issue.id} onOpenChange={(open) => setDialogOpen(open ? issue.id : null)}>
                                  <DialogTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border-yellow-200 h-6 px-2 text-xs"
                                      title="View full prompt"
                                    >
                                      <FileText className="w-3 h-3" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                    <DialogHeader>
                                      <DialogTitle className="flex items-center gap-2">
                                        <Brain className="w-5 h-5" />
                                        AI Expert Fix Prompt - {issue.title}
                                      </DialogTitle>
                                      <DialogDescription>
                                        Generated security fix instructions ready to use with AI assistant
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <Textarea
                                        value={generatedPrompts[issue.id]}
                                        readOnly
                                        className="min-h-96 font-mono text-sm"
                                      />
                                      <div className="flex gap-2">
                                        <Button
                                          onClick={() => copyPromptToClipboard(issue.id)}
                                          className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
                                          size="lg"
                                        >
                                          <Copy className="w-4 h-4 mr-2" />
                                          📋 COPY PROMPT
                                        </Button>
                                        <Button
                                          variant="outline"
                                          onClick={() => setDialogOpen(null)}
                                        >
                                          Close
                                        </Button>
                                      </div>
                                      <div className="text-sm text-gray-600 dark:text-gray-400 p-3 bg-blue-50 dark:bg-blue-950 rounded">
                                        💡 <strong>How to use:</strong> Click "📋 COPY PROMPT" to copy this prompt, then paste it in a new chat with me (the AI assistant) to get specific implementation help.
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
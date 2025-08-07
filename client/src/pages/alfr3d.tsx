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
  const [generatedPrompt, setGeneratedPrompt] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(false);
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
    onSuccess: (data) => {
      if (selectedIssue && data.fixPrompt) {
        const prompt = `🔒 SECURITY FIX REQUEST

ISSUE: ${selectedIssue.title}
FILE: ${selectedIssue.file}
LINE: ${selectedIssue.line || 'N/A'}
SEVERITY: ${selectedIssue.severity.toUpperCase()}

DESCRIPTION:
${selectedIssue.description}

AI EXPERT ANALYSIS:
${data.fixPrompt.analysis}

RECOMMENDED STEPS:
${data.fixPrompt.steps.map((step: string, i: number) => `${i + 1}. ${step}`).join('\n')}

RISK LEVEL: ${data.fixPrompt.riskLevel.toUpperCase()}
ESTIMATED TIME: ${data.fixPrompt.estimatedTime}

PREREQUISITES:
${data.fixPrompt.prerequisites.map((req: string) => `• ${req}`).join('\n')}

TESTING APPROACH:
${data.fixPrompt.testingApproach}

---
Please implement this security fix following the expert recommendations above.`;
        setGeneratedPrompt(prompt);
        setDialogOpen(true);
      }
      toast({
        title: "AI Fix Prompt Generated",
        description: "Expert analysis completed. View and copy the prompt.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate AI fix prompt. Please try again.",
        variant: "destructive",
      });
    },
  });

  const copyPromptToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedPrompt);
      toast({
        title: "Copied to Clipboard",
        description: "AI fix prompt copied! You can now paste it in chat with me.",
      });
      setDialogOpen(false);
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Issue</TableHead>
                    <TableHead>File</TableHead>
                    <TableHead>Line</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredIssues.map((issue) => (
                    <TableRow key={issue.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(issue.type)}
                          <span className="capitalize">{issue.type}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getSeverityColor(issue.severity)}>
                          {issue.severity.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-black dark:text-white">{issue.title}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {issue.description}
                          </p>
                          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                            💡 {issue.recommendation}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {issue.file.replace(/^.*\/workspace\//, '')}
                      </TableCell>
                      <TableCell>{issue.line || '-'}</TableCell>
                      <TableCell className="text-sm">
                        {new Date(issue.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {issue.reviewed ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            <Check className="w-3 h-3 mr-1" />
                            Reviewed
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                            <Clock className="w-3 h-3 mr-1" />
                            Pending
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => reviewMutation.mutate({ 
                              id: issue.id, 
                              reviewed: !issue.reviewed 
                            })}
                            disabled={reviewMutation.isPending}
                          >
                            {issue.reviewed ? (
                              <>
                                <Eye className="w-3 h-3 mr-1" />
                                Unmark
                              </>
                            ) : (
                              <>
                                <Check className="w-3 h-3 mr-1" />
                                Mark Reviewed
                              </>
                            )}
                          </Button>
                          
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                                onClick={() => generateFixMutation.mutate({ issueId: issue.id, issue })}
                                disabled={generateFixMutation.isPending}
                              >
                                {generateFixMutation.isPending ? (
                                  <>
                                    <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                                    Generating...
                                  </>
                                ) : (
                                  <>
                                    <Bot className="w-3 h-3 mr-1" />
                                    AI Fix
                                  </>
                                )}
                              </Button>
                            </DialogTrigger>
                            {selectedIssue && generatedPrompt && (
                              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle className="flex items-center gap-2">
                                    <Brain className="w-5 h-5" />
                                    AI Expert Fix Prompt - {selectedIssue.title}
                                  </DialogTitle>
                                  <DialogDescription>
                                    Generated security fix instructions ready to use with AI assistant
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <Textarea
                                    value={generatedPrompt}
                                    readOnly
                                    className="min-h-96 font-mono text-sm"
                                  />
                                  <div className="flex gap-2">
                                    <Button
                                      onClick={copyPromptToClipboard}
                                      className="bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                      <Copy className="w-4 h-4 mr-2" />
                                      Copy & Use with AI Assistant
                                    </Button>
                                    <Button
                                      variant="outline"
                                      onClick={() => {
                                        setSelectedIssue(null);
                                        setGeneratedPrompt("");
                                      }}
                                    >
                                      Close
                                    </Button>
                                  </div>
                                  <div className="text-sm text-gray-600 dark:text-gray-400 p-3 bg-blue-50 dark:bg-blue-950 rounded">
                                    💡 <strong>How to use:</strong> Click "Copy & Use with AI Assistant" to copy this prompt, then paste it in a new chat with me (the AI assistant) to get specific implementation help.
                                  </div>
                                </div>
                              </DialogContent>
                            )}
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
        
        {/* AI Fix Prompt Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                AI Expert Fix Prompt - {selectedIssue?.title}
              </DialogTitle>
              <DialogDescription>
                Generated security fix instructions ready to use with AI assistant
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea
                value={generatedPrompt}
                readOnly
                className="min-h-96 font-mono text-sm"
              />
              <div className="flex gap-2">
                <Button
                  onClick={copyPromptToClipboard}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy & Use with AI Assistant
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setDialogOpen(false);
                    setSelectedIssue(null);
                    setGeneratedPrompt("");
                  }}
                >
                  Close
                </Button>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 p-3 bg-blue-50 dark:bg-blue-950 rounded">
                💡 <strong>How to use:</strong> Click "Copy & Use with AI Assistant" to copy this prompt, then paste it in a new chat with me (the AI assistant) to get specific implementation help.
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
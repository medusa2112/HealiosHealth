import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Copy, Share, Users, Gift, Check } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface ReferralStats {
  referralCode: string;
  totalUses: number;
  totalEarned: number;
  claims: Array<{
    refereeEmail: string;
    rewardAmount: number;
    claimedAt: string;
    processed: boolean;
  }>;
}

export default function ReferralsPage() {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: referralStats, isLoading } = useQuery<ReferralStats>({
    queryKey: ['/api/referrals/stats'],
    refetchOnWindowFocus: false,
  });

  const { data: referralCode } = useQuery<{ code: string; shareUrl: string }>({
    queryKey: ['/api/referrals/my-referral'],
    refetchOnWindowFocus: false,
  });

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Referral link copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please copy the link manually",
        variant: "destructive",
      });
    }
  };

  const shareReferral = async () => {
    if (!referralCode?.shareUrl) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join Healios and save 10%!",
          text: "I've been loving my supplements from Healios. Use my referral link to get 10% off your first order!",
          url: referralCode.shareUrl,
        });
      } catch (err) {
        // User cancelled or share failed
        copyToClipboard(referralCode.shareUrl);
      }
    } else {
      copyToClipboard(referralCode.shareUrl);
    }
  };

  if (isLoading || !referralStats || !referralCode) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Referral Program</h1>
          <p className="text-muted-foreground">Share Healios with friends and earn rewards</p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Referral Program</h1>
        <p className="text-muted-foreground">
          Share Healios with friends and earn R10 credit for each successful referral
        </p>
      </div>

      {/* Referral Stats Overview */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Referral Code</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{referralStats.referralCode}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Your unique referral code
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">People Referred</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{referralStats.totalUses}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Friends who used your code
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R{referralStats.totalEarned.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Credits earned from referrals
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Share Your Code */}
      <Card>
        <CardHeader>
          <CardTitle>Share Your Referral Link</CardTitle>
          <CardDescription>
            When someone uses your link and makes their first purchase, you both benefit:
            they get 10% off and you earn R10 credit.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="flex-1 p-3 bg-muted rounded-md font-mono text-sm">
              {referralCode.shareUrl}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => copyToClipboard(referralCode.shareUrl)}
              className="shrink-0"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={shareReferral} className="flex-1">
              <Share className="mr-2 h-4 w-4" />
              Share Link
            </Button>
            <Button
              variant="outline"
              onClick={() => copyToClipboard(referralStats.referralCode)}
              className="flex-1"
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy Code Only
            </Button>
          </div>

          <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
            <strong>How it works:</strong>
            <br />
            1. Share your link with friends interested in premium supplements
            <br />
            2. They get 10% off their first order when they use your link
            <br />
            3. You earn R10 credit after their successful purchase
            <br />
            4. Credits are automatically applied to your next order
          </div>
        </CardContent>
      </Card>

      {/* Referral History */}
      {referralStats.claims.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Referrals</CardTitle>
            <CardDescription>
              People who have used your referral code
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {referralStats.claims.map((claim, index) => {
                const email = claim.refereeEmail;
                const maskedEmail = email.length > 3 
                  ? `${email.substring(0, 3)}***@${email.split('@')[1]}`
                  : '***@***';
                
                return (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <Users className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{maskedEmail}</div>
                        <div className="text-sm text-muted-foreground">
                          Joined {new Date(claim.claimedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">+R{claim.rewardAmount.toFixed(2)}</div>
                      <Badge variant={claim.processed ? "default" : "secondary"} className="text-xs">
                        {claim.processed ? "Credited" : "Processing"}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {referralStats.totalUses === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <Users className="h-12 w-12 text-muted-foreground mx-auto" />
              <h3 className="font-semibold">Start sharing your code!</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Share your referral link with friends and family to start earning credits.
                Both you and your friends will benefit from every successful referral.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
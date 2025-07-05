
import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Mail, Search, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

export function EmailScanSection() {
  const [isScanning, setIsScanning] = useState(false);
  const [currentScanId, setCurrentScanId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: lastScan, refetch: refetchLastScan } = useQuery({
    queryKey: ['last-email-scan'],
    queryFn: async () => {
      console.log('Fetching last email scan...');
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.error('No session found for email scan query');
        throw new Error('Authentication required');
      }

      const { data, error } = await supabase
        .from('email_scan_logs')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching email scan logs:', error);
        throw error;
      }
      
      console.log('Last scan data:', data);
      return data;
    },
  });

  // Poll for scan status updates when there's an active scan
  useEffect(() => {
    if (currentScanId || (lastScan && lastScan.status === 'running')) {
      const pollInterval = setInterval(() => {
        console.log('Polling for scan status update...');
        refetchLastScan();
      }, 3000); // Poll every 3 seconds

      return () => clearInterval(pollInterval);
    }
  }, [currentScanId, lastScan?.status, refetchLastScan]);

  // Update UI state based on scan status
  useEffect(() => {
    if (lastScan) {
      if (lastScan.status === 'running') {
        setIsScanning(true);
      } else if (lastScan.status === 'completed' || lastScan.status === 'failed') {
        setIsScanning(false);
        setCurrentScanId(null);
        
        // Show completion toast
        if (lastScan.status === 'completed') {
          toast.success(`Email scan completed! Found ${lastScan.subscriptions_found || 0} subscriptions.`);
        } else if (lastScan.status === 'failed') {
          toast.error('Email scan failed. Please try again.');
        }
      }
    }
  }, [lastScan?.status]);

  const scanEmailsMutation = useMutation({
    mutationFn: async () => {
      console.log('Starting email scan via Supabase Edge Function');
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error('Authentication required');
      }
      
      console.log('Session found, calling edge function...');
      
      const { data, error } = await supabase.functions.invoke('scan-emails', {
        body: {},
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }
      
      console.log('Edge function response:', data);
      return data;
    },
    onSuccess: (data) => {
      console.log('Email scan started successfully:', data);
      toast.success('Email scan started successfully!');
      setCurrentScanId(data.scanId);
      setIsScanning(true);
      queryClient.invalidateQueries({ queryKey: ['last-email-scan'] });
      queryClient.invalidateQueries({ queryKey: ['user-subscriptions'] });
    },
    onError: (error) => {
      console.error('Scan error:', error);
      toast.error(`Failed to start email scan: ${error.message}`);
      setIsScanning(false);
      setCurrentScanId(null);
    },
  });

  const handleScanEmails = () => {
    console.log('Email scan button clicked');
    scanEmailsMutation.mutate();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'running':
        return <Clock className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Mail className="h-5 w-5 text-gray-500" />;
    }
  };

  const isCurrentlyScanning = isScanning || lastScan?.status === 'running';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Email Scanning
        </CardTitle>
        <CardDescription>
          Automatically scan your Gmail inbox for subscription-related emails
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {lastScan && (
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Last Scan</span>
              {getStatusIcon(lastScan.status)}
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Emails Processed</p>
                <p className="font-medium">{lastScan.emails_processed || 0}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Subscriptions Found</p>
                <p className="font-medium">{lastScan.subscriptions_found || 0}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Started</p>
                <p className="font-medium">
                  {new Date(lastScan.started_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            {lastScan.status === 'running' && (
              <div className="mt-3">
                <Progress value={65} className="mb-2" />
                <p className="text-xs text-muted-foreground text-center">
                  Scanning in progress...
                </p>
              </div>
            )}
            {lastScan.status === 'failed' && lastScan.error_message && (
              <div className="mt-3 p-2 bg-red-50 rounded text-sm text-red-600">
                Error: {lastScan.error_message}
              </div>
            )}
          </div>
        )}

        <Button 
          onClick={handleScanEmails}
          disabled={isCurrentlyScanning || scanEmailsMutation.isLoading}
          className="w-full"
        >
          <Search className="h-4 w-4 mr-2" />
          {isCurrentlyScanning
            ? 'Scanning Emails...' 
            : 'Scan Email Inbox'
          }
        </Button>

        <p className="text-xs text-muted-foreground">
          We'll scan your Gmail inbox for subscription confirmations, billing notifications, 
          and renewal reminders to automatically detect your subscriptions.
        </p>
      </CardContent>
    </Card>
  );
}

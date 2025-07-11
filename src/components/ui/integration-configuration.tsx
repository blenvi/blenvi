'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import {
  IconActivity,
  IconBell,
  IconBookmark,
  IconCopy,
  IconExternalLink,
  IconEye,
  IconEyeOff,
  IconFlask2,
  IconFocus,
  IconGraph,
  IconRefresh,
  IconSettings,
} from '@tabler/icons-react';
import { mockIntegrations } from '@/constants';
import { notFound } from 'next/navigation';

export function IntegrationConfiguration({
  integrationSlug,
}: Readonly<{
  integrationSlug: string;
}>) {
  const selectedIntegration = mockIntegrations.find(i => i.slug === integrationSlug);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Get integration from URL parameter (you can implement this with useSearchParams)
  // For now, we'll use the first integration as default

  if (!selectedIntegration) {
    return notFound();
  }

  const toggleSecretVisibility = (field: string) => {
    setShowSecrets(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const testConnection = async () => {
    setIsTestingConnection(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsTestingConnection(false);
    toast.success('Connection test successful!');
  };

  const saveConfiguration = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSaving(false);
    toast.success('Configuration saved successfully!');
  };

  const renderConfigField = (
    key: string,
    value: string,
    type: 'text' | 'password' | 'select' | 'switch' | 'number' = 'text'
  ) => {
    const fieldId = `${selectedIntegration.id}-${key}`;
    const isSecret =
      key.toLowerCase().includes('key') ||
      key.toLowerCase().includes('secret') ||
      key.toLowerCase().includes('token');

    if (type === 'switch') {
      return (
        <div className="flex items-center justify-between">
          <Label htmlFor={fieldId} className="text-sm font-medium capitalize">
            {key.replace(/([A-Z])/g, ' $1').trim()}
          </Label>
          <Switch id={fieldId} checked={Boolean(value)} />
        </div>
      );
    }

    if (type === 'select' && key === 'currency') {
      return (
        <div className="space-y-2">
          <Label htmlFor={fieldId} className="text-sm font-medium capitalize">
            {key.replace(/([A-Z])/g, ' $1').trim()}
          </Label>
          <Select defaultValue={value}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="usd">USD - US Dollar</SelectItem>
              <SelectItem value="eur">EUR - Euro</SelectItem>
              <SelectItem value="gbp">GBP - British Pound</SelectItem>
            </SelectContent>
          </Select>
        </div>
      );
    }

    if (type === 'select' && key === 'region') {
      return (
        <div className="space-y-2">
          <Label htmlFor={fieldId} className="text-sm font-medium capitalize">
            {key.replace(/([A-Z])/g, ' $1').trim()}
          </Label>
          <Select defaultValue={value}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="us-east-1">US East (N. Virginia)</SelectItem>
              <SelectItem value="us-west-2">US West (Oregon)</SelectItem>
              <SelectItem value="eu-west-1">Europe (Ireland)</SelectItem>
              <SelectItem value="ap-southeast-1">Asia Pacific (Singapore)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <Label htmlFor={fieldId} className="text-sm font-medium capitalize">
          {key.replace(/([A-Z])/g, ' $1').trim()}
        </Label>
        <div className="relative">
          <Input
            id={fieldId}
            type={isSecret && !showSecrets[key] ? 'password' : 'text'}
            defaultValue={value}
            className={isSecret ? 'pr-20' : ''}
          />
          {isSecret && (
            <div className="absolute top-1 right-1 flex space-x-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => toggleSecretVisibility(key)}
              >
                {showSecrets[key] ? (
                  <IconEyeOff className="h-3 w-3" />
                ) : (
                  <IconEye className="h-3 w-3" />
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => copyToClipboard(value)}
              >
                <IconCopy className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full px-4 lg:px-6">
      {/* Configuration Panel */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`rounded-lg border p-3`}>
                <selectedIntegration.icon className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl">{selectedIntegration.name}</CardTitle>
                <CardDescription>{selectedIntegration.description}</CardDescription>
              </div>
            </div>
            <Button variant="outline" size="sm" asChild>
              <a href="/" target="_blank" rel="noopener noreferrer">
                <IconExternalLink className="mr-2 h-4 w-4" />
                Docs
              </a>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="configuration" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="configuration">
                <IconSettings className="mr-2 h-4 w-4" />
                Configuration
              </TabsTrigger>
              <TabsTrigger value="features">
                <IconActivity className="mr-2 h-4 w-4" />
                Features
              </TabsTrigger>
              <TabsTrigger value="webhooks">
                <IconBell className="mr-2 h-4 w-4" />
                Webhooks
              </TabsTrigger>
              <TabsTrigger value="monitoring">
                <IconGraph className="mr-2 h-4 w-4" />
                Monitoring
              </TabsTrigger>
            </TabsList>

            <TabsContent value="configuration" className="space-y-6">
              <Alert>
                <IconFocus className="h-4 w-4" />
                <AlertTitle>Configuration Settings</AlertTitle>
                <AlertDescription>
                  Update your {selectedIntegration.name} configuration. Changes will be applied
                  immediately.
                </AlertDescription>
              </Alert>

              <div className="grid gap-4 md:grid-cols-2">
                {Object.entries(selectedIntegration.config).map(([key, value]) => (
                  <div key={key}>
                    {(() => {
                      if (typeof value === 'boolean') {
                        return renderConfigField(key, value.toString(), 'switch');
                      } else if (key === 'currency' || key === 'region') {
                        return renderConfigField(key, value, 'select');
                      } else if (typeof value === 'number') {
                        return renderConfigField(key, value.toString(), 'number');
                      } else {
                        return renderConfigField(key, value, 'text');
                      }
                    })()}
                  </div>
                ))}
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-sm font-medium">Connection Status</h3>
                  <p className="text-muted-foreground text-xs">
                    Test your configuration to ensure everything is working correctly
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={testConnection} disabled={isTestingConnection}>
                    {isTestingConnection ? (
                      <IconRefresh className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <IconFlask2 className="mr-2 h-4 w-4" />
                    )}
                    Test Connection
                  </Button>
                  <Button onClick={saveConfiguration} disabled={isSaving}>
                    {isSaving ? (
                      <IconRefresh className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <IconBookmark className="mr-2 h-4 w-4" />
                    )}
                    Save Changes
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="features" className="space-y-4">
              <Alert>
                <IconActivity className="h-4 w-4" />
                <AlertTitle>Available Features</AlertTitle>
                <AlertDescription>
                  Manage which features are enabled for this integration.
                </AlertDescription>
              </Alert>

              <div className="grid gap-4 md:grid-cols-2">
                {selectedIntegration.features.map(feature => (
                  <Card key={feature}>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium">{feature}</h4>
                          <p className="text-muted-foreground text-xs">
                            {feature} functionality for {selectedIntegration.name}
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="webhooks" className="space-y-4">
              <Alert>
                <IconBell className="h-4 w-4" />
                <AlertTitle>Webhook Configuration</AlertTitle>
                <AlertDescription>
                  Configure webhooks to receive real-time notifications from{' '}
                  {selectedIntegration.name}.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="webhook-url">Webhook URL</Label>
                    <Input
                      id="webhook-url"
                      placeholder="https://your-app.com/webhooks"
                      defaultValue={`https://your-app.com/webhooks/${selectedIntegration.id}`}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="webhook-secret">Webhook Secret</Label>
                    <div className="relative">
                      <Input
                        id="webhook-secret"
                        type={showSecrets.webhookSecret ? 'text' : 'password'}
                        defaultValue="whsec_1234567890abcdef"
                        className="pr-20"
                      />
                      <div className="absolute top-1 right-1 flex space-x-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => toggleSecretVisibility('webhookSecret')}
                        >
                          {showSecrets.webhookSecret ? (
                            <IconEyeOff className="h-3 w-3" />
                          ) : (
                            <IconEye className="h-3 w-3" />
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => copyToClipboard('whsec_1234567890abcdef')}
                        >
                          <IconCopy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Available Events</h4>
                  {selectedIntegration.webhooks.length > 0 ? (
                    <div className="grid gap-2 md:grid-cols-2">
                      {selectedIntegration.webhooks.map(webhook => (
                        <div
                          key={webhook}
                          className="flex items-center justify-between rounded-lg border p-3"
                        >
                          <div>
                            <p className="text-sm font-medium">{webhook}</p>
                            <p className="text-muted-foreground text-xs">
                              Triggered when {webhook.split('.')[1]} occurs
                            </p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      No webhooks available for this integration.
                    </p>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="monitoring" className="space-y-4">
              <Alert>
                <IconGraph className="h-4 w-4" />
                <AlertTitle>Integration Health</AlertTitle>
                <AlertDescription>
                  Monitor the performance and health of your {selectedIntegration.name} integration.
                </AlertDescription>
              </Alert>

              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Health Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{selectedIntegration.health}%</div>
                    <Progress value={selectedIntegration.health} className="mt-2" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Uptime</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">99.9%</div>
                    <p className="text-muted-foreground text-xs">Last 30 days</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Response Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">45ms</div>
                    <p className="text-muted-foreground text-xs">Average</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <div className="flex-1">
                        <p className="text-sm">Connection test successful</p>
                        <p className="text-muted-foreground text-xs">2 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="h-2 w-2 rounded-full bg-blue-500" />
                      <div className="flex-1">
                        <p className="text-sm">Configuration updated</p>
                        <p className="text-muted-foreground text-xs">1 hour ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="h-2 w-2 rounded-full bg-yellow-500" />
                      <div className="flex-1">
                        <p className="text-sm">Rate limit warning</p>
                        <p className="text-muted-foreground text-xs">3 hours ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

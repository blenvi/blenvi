'use client';

import { useState } from 'react';

import {
  IconActivity,
  IconAlertTriangle,
  IconBolt,
  IconClock,
  IconTrendingDown,
  IconTrendingUp,
} from '@tabler/icons-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

const flowMetrics = [
  {
    id: 'user-auth',
    name: 'User → Authentication',
    requests: '12.8K',
    avgLatency: '45ms',
    successRate: 99.8,
    trend: 'up',
    change: '+2.3%',
  },
  {
    id: 'auth-app',
    name: 'Auth → Application',
    requests: '12.7K',
    avgLatency: '23ms',
    successRate: 99.9,
    trend: 'up',
    change: '+1.8%',
  },
  {
    id: 'app-api',
    name: 'App → API Routes',
    requests: '45.2K',
    avgLatency: '67ms',
    successRate: 98.5,
    trend: 'down',
    change: '-0.5%',
  },
  {
    id: 'api-database',
    name: 'API → Database',
    requests: '43.1K',
    avgLatency: '89ms',
    successRate: 99.2,
    trend: 'up',
    change: '+0.8%',
  },
  {
    id: 'app-payments',
    name: 'App → Payments',
    requests: '3.4K',
    avgLatency: '234ms',
    successRate: 99.7,
    trend: 'up',
    change: '+5.2%',
  },
  {
    id: 'app-email',
    name: 'App → Email Service',
    requests: '8.9K',
    avgLatency: '156ms',
    successRate: 98.9,
    trend: 'up',
    change: '+1.2%',
  },
];

const systemMetrics = {
  totalRequests: '156.7K',
  avgResponseTime: '78ms',
  errorRate: '0.3%',
  uptime: '99.9%',
  dataTransferred: '2.4GB',
  activeConnections: 1247,
};

const alerts = [
  {
    id: 1,
    type: 'warning',
    message: 'Upstash Redis latency increased by 15%',
    timestamp: '5 minutes ago',
    service: 'Cache',
  },
  {
    id: 2,
    type: 'info',
    message: 'Stripe webhook processing completed successfully',
    timestamp: '12 minutes ago',
    service: 'Payments',
  },
  {
    id: 3,
    type: 'success',
    message: 'Database backup completed',
    timestamp: '1 hour ago',
    service: 'Database',
  },
];

export function DataFlowMetrics() {
  const [timeRange, setTimeRange] = useState('1h');

  return (
    <div className="space-y-6 px-4 lg:px-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Data Flow Metrics</h2>
        <div className="flex items-center space-x-2">
          <Button
            variant={timeRange === '1h' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('1h')}
          >
            1H
          </Button>
          <Button
            variant={timeRange === '24h' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('24h')}
          >
            24H
          </Button>
          <Button
            variant={timeRange === '7d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('7d')}
          >
            7D
          </Button>
        </div>
      </div>

      <Tabs defaultValue="flows" className="w-full">
        <TabsList className="grid w-full grid-cols-3 gap-x-4">
          <TabsTrigger value="flows">Data Flows</TabsTrigger>
          <TabsTrigger value="system">System Metrics</TabsTrigger>
          <TabsTrigger value="alerts">Alerts & Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="flows" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {flowMetrics.map(flow => (
              <Card key={flow.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">{flow.name}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="text-xs">
                      {flow.requests} requests
                    </Badge>
                    <div className="flex items-center space-x-1">
                      {flow.trend === 'up' ? (
                        <IconTrendingUp className="h-3 w-3 text-green-500" />
                      ) : (
                        <IconTrendingDown className="h-3 w-3 text-red-500" />
                      )}
                      <span
                        className={`text-xs ${flow.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}
                      >
                        {flow.change}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Avg Latency</span>
                      <div className="font-medium">{flow.avgLatency}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Success Rate</span>
                      <div className="font-medium">{flow.successRate}%</div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Health</span>
                      <span className="font-medium">{flow.successRate}%</span>
                    </div>
                    <Progress value={flow.successRate} className="h-1" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                <IconActivity className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemMetrics.totalRequests}</div>
                <p className="text-muted-foreground text-xs">Last {timeRange}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                <IconClock className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemMetrics.avgResponseTime}</div>
                <p className="text-muted-foreground text-xs">Across all services</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
                <IconAlertTriangle className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemMetrics.errorRate}</div>
                <p className="text-muted-foreground text-xs">Well within limits</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
                <IconBolt className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemMetrics.uptime}</div>
                <p className="text-muted-foreground text-xs">Last 30 days</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Data Transferred</CardTitle>
                <IconActivity className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemMetrics.dataTransferred}</div>
                <p className="text-muted-foreground text-xs">Last {timeRange}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Connections</CardTitle>
                <IconBolt className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {systemMetrics.activeConnections.toLocaleString()}
                </div>
                <p className="text-muted-foreground text-xs">Real-time</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <div className="space-y-3">
            {alerts.map(alert => (
              <Card key={alert.id}>
                <CardContent className="pt-4">
                  <div className="flex items-start space-x-3">
                    <div className={cn('mt-0.5 h-2 w-2 rounded-full')} />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{alert.message}</p>
                        <Badge variant="outline" className="text-xs">
                          {alert.service}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-xs">{alert.timestamp}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

'use client';

import { useState } from 'react';

import {
  IconArrowsUpDown,
  IconBell,
  IconBrandAuth0,
  IconBrandOpenai,
  IconBrandStripe,
  IconBrandSupabase,
  IconBrandVercel,
  IconChevronDown,
  IconDatabase,
  IconDotsVertical,
  IconExternalLink,
  IconFilter,
  IconGraph,
  IconMail,
  IconSettings,
} from '@tabler/icons-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';

const integrations = [
  {
    id: 'supabase',
    name: 'Supabase',
    description: 'Database & Backend Services',
    icon: IconBrandSupabase,
    status: 'connected',
    health: 98,
    lastSync: '1 min ago',
    requests: '45.2K',
    color: 'bg-green-500',
    category: 'Database',
    lastUpdated: new Date('2024-01-15T10:30:00'),
  },
  {
    id: 'auth0',
    name: 'Auth0',
    description: 'Identity Management Platform',
    icon: IconBrandAuth0,
    status: 'connected',
    health: 99,
    lastSync: '45 sec ago',
    requests: '18.5K',
    color: 'bg-orange-500',
    category: 'Auth',
    lastUpdated: new Date('2024-01-15T10:29:15'),
  },
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Payment Processing',
    icon: IconBrandStripe,
    status: 'connected',
    health: 95,
    lastSync: '2 min ago',
    requests: '3.4K',
    color: 'bg-purple-500',
    category: 'Payments',
    lastUpdated: new Date('2024-01-15T10:28:00'),
  },
  {
    id: 'resend',
    name: 'Resend',
    description: 'Email Delivery Service',
    icon: IconMail,
    status: 'connected',
    health: 97,
    lastSync: '5 min ago',
    requests: '8.9K',
    color: 'bg-orange-500',
    category: 'Email',
    lastUpdated: new Date('2024-01-15T10:25:00'),
  },
  {
    id: 'vercel',
    name: 'Vercel',
    description: 'Deployment & Hosting',
    icon: IconBrandVercel,
    status: 'connected',
    health: 99,
    lastSync: '1 min ago',
    requests: '156.7K',
    color: 'bg-black',
    category: 'Infrastructure',
    lastUpdated: new Date('2024-01-15T10:29:00'),
  },
  {
    id: 'analytics',
    name: 'Vercel Analytics',
    description: 'Performance Monitoring',
    icon: IconGraph,
    status: 'connected',
    health: 100,
    lastSync: '30 sec ago',
    requests: '89.3K',
    color: 'bg-cyan-500',
    category: 'Analytics',
    lastUpdated: new Date('2024-01-15T10:29:30'),
  },
  {
    id: 'upstash',
    name: 'Upstash Redis',
    description: 'Caching & Session Storage',
    icon: IconDatabase,
    status: 'warning',
    health: 85,
    lastSync: '10 min ago',
    requests: '23.1K',
    color: 'bg-red-500',
    category: 'Cache',
    lastUpdated: new Date('2024-01-15T10:20:00'),
  },
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'AI & Machine Learning',
    icon: IconBrandOpenai,
    status: 'connected',
    health: 94,
    lastSync: '3 min ago',
    requests: '5.6K',
    color: 'bg-emerald-500',
    category: 'AI',
    lastUpdated: new Date('2024-01-15T10:27:00'),
  },
];

export function IntegrationCards() {
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  interface Integration {
    id: string;
    name: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    status: string;
    health: number;
    lastSync: string;
    requests: string;
    color: string;
    category: string;
    lastUpdated: Date;
  }

  const sortIntegrations = (integrations: Integration[], sortBy: string) => {
    return [...integrations].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'health':
          return b.health - a.health;
        case 'requests':
          return (
            Number.parseInt(b.requests.replace(/[^\d]/g, '')) -
            Number.parseInt(a.requests.replace(/[^\d]/g, ''))
          );
        case 'category':
          return a.category.localeCompare(b.category);
        case 'status': {
          const statusOrder = { connected: 0, warning: 1, error: 2 };
          return (
            statusOrder[a.status as keyof typeof statusOrder] -
            statusOrder[b.status as keyof typeof statusOrder]
          );
        }
        case 'lastUpdated':
          return b.lastUpdated.getTime() - a.lastUpdated.getTime();
        default:
          return 0;
      }
    });
  };

  const categories = ['all', ...new Set(integrations.map(i => i.category.toLowerCase()))];

  const filteredAndSortedIntegrations = sortIntegrations(
    filter === 'all' ? integrations : integrations.filter(i => i.category.toLowerCase() === filter),
    sortBy
  );

  return (
    <div className="space-y-4 px-4 lg:px-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Active Integrations</h2>
        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <IconArrowsUpDown className="mr-2 h-4 w-4" />
                <IconChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={() => setSortBy('name')}
                className={sortBy === 'name' ? 'bg-accent' : ''}
              >
                Name (A-Z)
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setSortBy('health')}
                className={sortBy === 'health' ? 'bg-accent' : ''}
              >
                Health (High to Low)
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setSortBy('requests')}
                className={sortBy === 'requests' ? 'bg-accent' : ''}
              >
                Requests (High to Low)
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setSortBy('category')}
                className={sortBy === 'category' ? 'bg-accent' : ''}
              >
                Category (A-Z)
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setSortBy('status')}
                className={sortBy === 'status' ? 'bg-accent' : ''}
              >
                Status (Best First)
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setSortBy('lastUpdated')}
                className={sortBy === 'lastUpdated' ? 'bg-accent' : ''}
              >
                Recently Updated
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <IconFilter className="mr-2 h-4 w-4" />
                <IconChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={() => setFilter('all')}
                className={filter === 'all' ? 'bg-accent' : ''}
              >
                All Categories
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {categories.slice(1).map(category => (
                <DropdownMenuItem
                  key={category}
                  onClick={() => setFilter(category)}
                  className={filter === category ? 'bg-accent' : ''}
                >
                  <span className="capitalize">{category}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-3">
        {filteredAndSortedIntegrations.map(integration => (
          <Card key={integration.id} className="relative overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`bg-secondary rounded-lg border p-2 shadow-inner`}>
                    <integration.icon className="size-4" />
                  </div>
                  <CardTitle>{integration.name}</CardTitle>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <IconDotsVertical className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <IconExternalLink className="mr-2 h-4 w-4" />
                      Open Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <IconSettings className="mr-2 h-4 w-4" />
                      Configure
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <IconBell className="mr-2 h-4 w-4" />
                      View Logs
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Health</span>
                  <span className="font-medium">{integration.health}%</span>
                </div>
                <Progress value={integration.health} className="h-1" />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Last Sync</span>
                  <div className="font-medium">{integration.lastSync}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Requests</span>
                  <div className="font-medium">{integration.requests}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

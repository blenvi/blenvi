'use client';

import { LogoutButton } from '@/components/auth/logout-button';
import { Card, CardContent } from '@/components/ui/card';

export function AccountActions() {
  return (
    <div className="px-4 lg:px-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Account Actions</h3>
              <p className="text-muted-foreground text-sm">Sign out of your account</p>
            </div>
            <LogoutButton />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

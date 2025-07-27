'use client';

import {
  IconUser,
  IconMail,
  IconAt,
  IconX,
  IconDeviceFloppy,
  IconRefresh,
  IconCheck,
  IconAlertCircle,
} from '@tabler/icons-react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useAccountStore } from '@/stores/account';

export function ProfileForm() {
  const { user, isEditing, isSaving, profileData, updateField, saveProfile, cancelEditing } =
    useAccountStore();

  return (
    <div className="px-4 lg:px-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Profile Information
            {isEditing && (
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={cancelEditing}>
                  <IconX className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button size="sm" onClick={saveProfile} disabled={isSaving}>
                  {isSaving ? (
                    <IconRefresh className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <IconDeviceFloppy className="mr-2 h-4 w-4" />
                  )}
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            )}
          </CardTitle>
          <CardDescription>
            {isEditing
              ? 'Update your profile information. Changes will be saved to your account.'
              : 'Your profile information is displayed below. Click "Edit Profile" to make changes.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Name Fields */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="flex items-center text-sm font-medium">
                <IconUser className="text-muted-foreground mr-2 h-4 w-4" />
                First Name
              </Label>
              {isEditing ? (
                <Input
                  id="firstName"
                  value={profileData.firstname}
                  onChange={e => updateField('firstname', e.target.value)}
                  placeholder="Enter your first name"
                  className="h-11"
                />
              ) : (
                <div className="border-input bg-muted/30 flex h-11 items-center rounded-md border px-3 py-2 text-sm">
                  {profileData.firstname || 'Not set'}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName" className="flex items-center text-sm font-medium">
                <IconUser className="text-muted-foreground mr-2 h-4 w-4" />
                Last Name
              </Label>
              {isEditing ? (
                <Input
                  id="lastName"
                  value={profileData.lastname}
                  onChange={e => updateField('lastname', e.target.value)}
                  placeholder="Enter your last name"
                  className="h-11"
                />
              ) : (
                <div className="border-input bg-muted/30 flex h-11 items-center rounded-md border px-3 py-2 text-sm">
                  {profileData.lastname || 'Not set'}
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center text-sm font-medium">
              <IconMail className="text-muted-foreground mr-2 h-4 w-4" />
              Email Address
            </Label>
            <div className="border-input bg-muted/30 flex h-11 items-center justify-between rounded-md border px-3 py-2 text-sm">
              <span>{user?.email}</span>
              <Badge
                variant="secondary"
                className="border-green-200 bg-green-50 text-green-600 dark:bg-green-950"
              >
                <IconCheck className="mr-1 h-3 w-3" />
                Verified
              </Badge>
            </div>
          </div>

          {/* Username Field */}
          <div className="space-y-2">
            <Label htmlFor="username" className="flex items-center text-sm font-medium">
              <IconAt className="text-muted-foreground mr-2 h-4 w-4" />
              Username
            </Label>
            {isEditing ? (
              <div className="space-y-2">
                <div className="relative">
                  <span className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2 text-sm">
                    @
                  </span>
                  <Input
                    id="username"
                    value={profileData.username}
                    onChange={e =>
                      updateField(
                        'username',
                        e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')
                      )
                    }
                    placeholder="your-username"
                    className="h-11 pl-8"
                  />
                </div>
                <p className="text-muted-foreground text-xs">
                  Your username must be unique and can only contain lowercase letters, numbers, and
                  hyphens.
                </p>
              </div>
            ) : (
              <div className="border-input bg-muted/30 flex h-11 items-center rounded-md border px-3 py-2 text-sm">
                @{profileData.username || 'Not set'}
              </div>
            )}
          </div>

          <Separator />

          {/* Bio Field */}
          <div className="space-y-2">
            <Label htmlFor="bio" className="text-sm font-medium">
              Bio
            </Label>
            {isEditing ? (
              <div className="space-y-2">
                <Textarea
                  id="bio"
                  value={profileData.bio}
                  onChange={e => updateField('bio', e.target.value)}
                  placeholder="Tell us about yourself..."
                  className="min-h-[100px] resize-none"
                  maxLength={500}
                />
                <div className="text-muted-foreground flex justify-between text-xs">
                  <span>Share a brief description about yourself</span>
                  <span>{profileData.bio.length}/500</span>
                </div>
              </div>
            ) : (
              <div className="border-input bg-muted/30 min-h-[100px] rounded-md border p-3 text-sm">
                {profileData.bio || 'No bio added yet.'}
              </div>
            )}
          </div>

          {isEditing && (
            <Alert>
              <IconAlertCircle className="h-4 w-4" />
              <AlertDescription>
                Make sure your profile information is accurate. This information may be visible to
                other users in your organization.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

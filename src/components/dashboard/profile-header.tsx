'use client';

import { IconCamera, IconCheck, IconUser } from '@tabler/icons-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAccountStore } from '@/stores/account';

export function ProfileHeader() {
  const {
    user,
    profileData,
    loading,
    isEditing,
    setIsEditing,
    setIsAvatarDialogOpen,
    getUserInitials,
    getDisplayAvatar,
  } = useAccountStore();

  console.warn('ProfileHeader rendering with data:', {
    user: user?.id,
    loading,
    profileData,
    initials: getUserInitials(),
    avatar: getDisplayAvatar(),
  });

  return (
    <div className="px-4 lg:px-6">
      <Card>
        <CardContent>
          <div className="flex flex-col items-start space-y-6 md:flex-row md:items-center md:space-y-0 md:space-x-8">
            {/* Avatar Section */}
            <div className="group relative">
              <Avatar className="border-background h-32 w-32 border-4 shadow-lg">
                <AvatarImage
                  src={getDisplayAvatar()}
                  alt={`${profileData.firstname} ${profileData.lastname}`}
                />
                <AvatarFallback className="bg-muted text-2xl">{getUserInitials()}</AvatarFallback>
              </Avatar>

              {isEditing && (
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute -right-2 -bottom-2 h-10 w-10 rounded-full shadow-lg"
                  onClick={() => setIsAvatarDialogOpen(true)}
                >
                  <IconCamera className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 space-y-4">
              <div>
                <div className="mb-2 flex items-center space-x-3">
                  <h2 className="text-foreground text-2xl font-bold">
                    {profileData.firstname || 'First Name'} {profileData.lastname || 'Last Name'}
                  </h2>
                  {user && (
                    <Badge
                      variant="secondary"
                      className="border-green-200 bg-green-50 text-green-600 dark:bg-green-950"
                    >
                      <IconCheck className="mr-1 h-3 w-3" />
                      Verified
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground">@{profileData.username || 'username'}</p>
                <p className="text-muted-foreground mt-1 text-sm">{user?.email}</p>
                {loading && (
                  <p className="text-muted-foreground mt-2 text-sm italic">
                    Loading profile data...
                  </p>
                )}
              </div>{' '}
              <div className="text-muted-foreground flex flex-wrap gap-4 text-sm">
                <div className="flex items-center space-x-1">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span>Active now</span>
                </div>
              </div>
              {!isEditing && (
                <Button onClick={() => setIsEditing(true)} className="mt-4">
                  <IconUser className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

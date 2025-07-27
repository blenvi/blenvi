'use client';

import { useRef } from 'react';

import { IconPhoto, IconUpload } from '@tabler/icons-react';
import { toast } from 'sonner';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAccountStore } from '@/stores/account';

export function AvatarDialog() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    isAvatarDialogOpen,
    setIsAvatarDialogOpen,
    getUserInitials,
    getDisplayAvatar,
    removeAvatar,
    confirmAvatarChange,
    setAvatarPreview,
    updateField,
  } = useAccountStore();

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      const reader = new FileReader();
      reader.onload = e => {
        const result = e.target?.result as string;
        setAvatarPreview(result);
        updateField('avatar_url', result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Dialog open={isAvatarDialogOpen} onOpenChange={setIsAvatarDialogOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Update Profile Picture</DialogTitle>
          <DialogDescription>
            Upload a new profile picture or remove your current one.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-center">
            <Avatar className="border-background h-24 w-24 border-4 shadow-lg">
              <AvatarImage src={getDisplayAvatar()} alt="Profile preview" />
              <AvatarFallback className="bg-muted text-lg">{getUserInitials()}</AvatarFallback>
            </Avatar>
          </div>

          <div className="grid gap-2">
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="w-full"
            >
              <IconUpload className="mr-2 h-4 w-4" />
              Upload New Picture
            </Button>

            <Button variant="outline" onClick={removeAvatar} className="w-full bg-transparent">
              <IconPhoto className="mr-2 h-4 w-4" />
              Use Default Avatar
            </Button>
          </div>

          <p className="text-muted-foreground text-center text-xs">
            Recommended: Square image, at least 400x400px, max 5MB
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsAvatarDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={confirmAvatarChange}>Save Changes</Button>
        </DialogFooter>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleAvatarUpload}
          className="hidden"
        />
      </DialogContent>
    </Dialog>
  );
}

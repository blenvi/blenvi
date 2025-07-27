'use client';

import { useEffect } from 'react';

import { type User } from '@supabase/supabase-js';

import { useAccountStore } from '@/stores/account';

import { AccountActions } from './account-actions';
import { AvatarDialog } from './avatar-dialog';
import { ProfileForm } from './profile-form';
import { ProfileHeader } from './profile-header';

export default function AccountForm({ user }: { readonly user: User | null }) {
  const { setUser, loadProfile, user: storeUser } = useAccountStore();

  // First, set the user in the store
  useEffect(() => {
    if (user) {
      setUser(user);
    }
  }, [user, setUser]);

  useEffect(() => {
    if (storeUser?.id) {
      loadProfile();
    }
  }, [storeUser, loadProfile]);

  return (
    <div className="space-y-8 px-4 lg:px-6">
      <ProfileHeader />
      <ProfileForm />
      <AccountActions />
      <AvatarDialog />
    </div>
  );
}

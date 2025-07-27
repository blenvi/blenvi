import { User } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { create } from 'zustand';

import { createClient } from '@/lib/supabase/client';

interface ProfileData {
  firstname: string;
  lastname: string;
  username: string;
  bio: string;
  avatar_url: string;
}

interface AccountState {
  user: User | null;
  loading: boolean;
  isEditing: boolean;
  isSaving: boolean;
  isAvatarDialogOpen: boolean;
  avatarPreview: string | null;
  profileData: ProfileData;
  originalData: ProfileData;

  // Actions
  setUser: (_user: User | null) => void;
  setIsEditing: (_isEditing: boolean) => void;
  setIsAvatarDialogOpen: (_isOpen: boolean) => void;
  setAvatarPreview: (_preview: string | null) => void;
  updateField: (_field: keyof ProfileData, _value: string) => void;
  loadProfile: () => Promise<void>;
  saveProfile: () => Promise<void>;
  cancelEditing: () => void;
  removeAvatar: () => void;
  confirmAvatarChange: () => void;

  // Computed
  getUserInitials: () => string;
  getDisplayAvatar: () => string;
}

// Helper function to create a default profile
async function createDefaultProfile(user: User) {
  try {
    const supabase = createClient();
    console.warn('Creating default profile for user:', user.id);

    const { error } = await supabase.from('profiles').insert({
      id: user.id,
      first_name: '',
      last_name: '',
      username: user.email?.split('@')[0] || '',
      bio: '',
      avatar_url: '',
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error('Error creating default profile:', error);
      throw error;
    }

    return {
      firstname: '',
      lastname: '',
      username: user.email?.split('@')[0] || '',
      bio: '',
      avatar_url: '',
    };
  } catch (err) {
    console.error('Error in createDefaultProfile:', err);
    throw err;
  }
}

export const useAccountStore = create<AccountState>((set, get) => ({
  user: null,
  loading: true,
  isEditing: false,
  isSaving: false,
  isAvatarDialogOpen: false,
  avatarPreview: null,
  profileData: {
    firstname: '',
    lastname: '',
    username: '',
    bio: '',
    avatar_url: '',
  },
  originalData: {
    firstname: '',
    lastname: '',
    username: '',
    bio: '',
    avatar_url: '',
  },

  setUser: _user => set({ user: _user }),

  setIsEditing: _isEditing => set({ isEditing: _isEditing }),

  setIsAvatarDialogOpen: _isOpen => set({ isAvatarDialogOpen: _isOpen }),

  setAvatarPreview: _preview => set({ avatarPreview: _preview }),

  updateField: (_field, _value) =>
    set(state => ({
      profileData: {
        ...state.profileData,
        [_field]: _value,
      },
    })),

  loadProfile: async () => {
    const supabase = createClient();
    const { user } = get();

    if (!user) {
      console.warn('Cannot load profile: No user in store');
      return;
    }

    console.warn('Loading profile for user:', user.id);
    try {
      set({ loading: true });

      const { data, error, status } = await supabase
        .from('profiles')
        .select(`first_name, last_name, username, bio, avatar_url`)
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error, 'status:', status);
        if (status !== 406) {
          // 406 is "Not Found" which is ok for new users
          throw error;
        } else {
          console.warn('Profile not found, will create default');
          // If profile doesn't exist yet, try to create one
          try {
            const defaultProfile = await createDefaultProfile(user);
            set({
              profileData: defaultProfile,
              originalData: { ...defaultProfile },
              loading: false,
            });
            return;
          } catch (createErr) {
            console.error('Failed to create default profile:', createErr);
            toast.error('Failed to create user profile');
            return;
          }
        }
      }

      console.warn('Profile data received:', data);

      if (data) {
        const profileData = {
          firstname: data.first_name || '',
          lastname: data.last_name || '',
          username: data.username || '',
          bio: data.bio || '',
          avatar_url: data.avatar_url || '',
        };

        console.warn('Processed profile data:', profileData);

        set({
          profileData,
          originalData: { ...profileData },
        });
      }
    } catch (err) {
      console.error(err);
      toast.error('Error loading user data!');
    } finally {
      set({ loading: false });
    }
  },

  saveProfile: async () => {
    const supabase = createClient();
    const { user, profileData } = get();

    if (!user) return;

    set({ isSaving: true });

    try {
      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        first_name: profileData.firstname,
        last_name: profileData.lastname,
        username: profileData.username,
        bio: profileData.bio,
        avatar_url: profileData.avatar_url,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      set({
        isEditing: false,
        avatarPreview: null,
        originalData: { ...profileData },
      });

      toast.success('Profile updated successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Error updating the data!');
    } finally {
      set({ isSaving: false });
    }
  },

  cancelEditing: () =>
    set(state => ({
      isEditing: false,
      avatarPreview: null,
      profileData: { ...state.originalData },
    })),

  removeAvatar: () => {
    set(state => ({
      avatarPreview: null,
      profileData: {
        ...state.profileData,
        avatar_url: '',
      },
    }));
    set({ isAvatarDialogOpen: false });
  },

  confirmAvatarChange: () => {
    set({ isAvatarDialogOpen: false });
    toast.success('Avatar updated!');
  },

  getUserInitials: () => {
    const { profileData } = get();
    const first = profileData.firstname;
    const last = profileData.lastname;
    return `${first[0] || ''}${last[0] || ''}`.toUpperCase();
  },

  getDisplayAvatar: () => {
    const { avatarPreview, profileData } = get();
    return avatarPreview || profileData.avatar_url || '/placeholder.svg';
  },
}));

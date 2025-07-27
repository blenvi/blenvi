import { createClient } from '@/lib/supabase/server';

import AccountForm from '../dashboard/account-form';

export default async function Account() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <AccountForm user={user} />
        </div>
      </div>
    </div>
  );
}

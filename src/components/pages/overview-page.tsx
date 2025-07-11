import { DataTable } from '@/components/data-table';
import data from './data.json';
import { Suspense } from 'react';
import OverviewCards from '../overview-cards';

export default function OverviewPage() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <Suspense fallback={<div>Loading overview cards...</div>}>
            <OverviewCards />
          </Suspense>
          <DataTable data={data} />
        </div>
      </div>
    </div>
  );
}

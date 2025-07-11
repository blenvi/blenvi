import { IntegrationConfiguration } from '../ui/integration-configuration';

export default function IntegrationPage({
  integrationSlug,
}: Readonly<{
  integrationSlug: string;
}>) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <IntegrationConfiguration integrationSlug={integrationSlug} />
        </div>
      </div>
    </div>
  );
}

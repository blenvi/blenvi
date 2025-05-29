export default function ConfigurePage({
  teamId,
  projectId,
}: {
  readonly teamId: string;
  readonly projectId: string;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          {`teamId: ${teamId}, projectId: ${projectId}`}
        </div>
      </div>
    </div>
  );
}

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const cronSecret = process.env.CRON_SECRET;

if (!cronSecret) {
  throw new Error("Missing CRON_SECRET. Add it to apps/web/.env.local first.");
}

const response = await fetch(`${appUrl}/api/poll`, {
  method: "GET",
  headers: {
    Authorization: `Bearer ${cronSecret}`,
  },
});

const body = await response.text();

console.log(`[test:poll] status=${response.status}`);
console.log(body);

export {};

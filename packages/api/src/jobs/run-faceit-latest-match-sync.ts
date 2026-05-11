import { syncLatestFaceitMatchForAllTrackedAccounts } from "../services/faceit/faceit-latest-match-sync";

if (!process.env.FACEIT_API_KEY?.trim()) {
  console.error("FACEIT_API_KEY is required to run faceit-sync:latest");
  process.exit(1);
}

async function main() {
  const summary = await syncLatestFaceitMatchForAllTrackedAccounts();
  console.log(JSON.stringify(summary, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

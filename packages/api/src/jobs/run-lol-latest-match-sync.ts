import { syncLatestLolMatchForAllTrackedAccounts } from "../services/riot/lol-latest-match-sync";

async function main() {
  const summary = await syncLatestLolMatchForAllTrackedAccounts();
  console.log(JSON.stringify(summary, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

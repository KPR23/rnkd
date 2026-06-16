export function getLolChampionSplashUrl(championIconUrl: string) {
  const championKey = championIconUrl.match(/\/champion\/([^/.]+)\.png$/)?.[1];

  if (!championKey) {
    return null;
  }

  return `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${championKey}_0.jpg`;
}

import type { ConfigContext, ExpoConfig } from "expo/config";

import pkg from "./package.json";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: config.name ?? "Rnkd",
  slug: config.slug ?? "rnkd",
  version: pkg.version,
});

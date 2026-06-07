import type { ExpoConfig } from "expo/config";

import appJson from "./app.json";
import pkg from "./package.json";

const config = appJson.expo as ExpoConfig;

export default (): ExpoConfig => ({
  ...config,
  version: pkg.version,
  plugins: config.plugins ?? [],
});

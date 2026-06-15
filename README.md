### Local development

Use the local dev script when you want the mobile app to talk to the Next.js
server running on your machine instead of the deployed production server:

```sh
pnpm dev:local
```

The script detects your LAN IP, writes `apps/mobile/.env`, and starts both:

- `apps/web` on port `3000`
- `apps/mobile` with `EXPO_PUBLIC_SERVER_URL=http://<your-lan-ip>:3000`

Your phone must be on the same Wi-Fi network as your computer. For a simulator
or a custom host, override the detected URL:

```sh
EXPO_PUBLIC_SERVER_URL=http://127.0.0.1:3000 pnpm dev:local
```

Keep secrets such as `DATABASE_URL`, `BETTER_AUTH_SECRET`, OAuth keys, and API
keys in `apps/web/.env`. The script only overrides `BETTER_AUTH_URL` for the
running web process so auth callbacks match the local mobile server URL.

### Staging Environment

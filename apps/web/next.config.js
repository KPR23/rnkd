/** @type {import('next').NextConfig} */
const allowedDevOrigins = [
  "https://alvera-epeiric-abatedly.ngrok-free.dev",
  "http://localhost:3000",
];

if (process.env.EXPO_PUBLIC_SERVER_URL) {
  allowedDevOrigins.push(process.env.EXPO_PUBLIC_SERVER_URL);
}

const nextConfig = {
  serverExternalPackages: [
    "better-auth",
    "@better-auth/expo",
    "@better-auth/core",
  ],
  allowedDevOrigins,
};

export default nextConfig;

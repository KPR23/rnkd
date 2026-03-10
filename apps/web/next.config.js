/** @type {import('next').NextConfig} */
const nextConfig = {
	serverExternalPackages: [
		"better-auth",
		"@better-auth/expo",
		"@better-auth/core",
	],
	allowedDevOrigins: [
		"https://alvera-epeiric-abatedly.ngrok-free.dev",
		"http://localhost:3000",
	],
};

export default nextConfig;

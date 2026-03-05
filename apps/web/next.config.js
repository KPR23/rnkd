/** @type {import('next').NextConfig} */

const nextConfig = {
	serverExternalPackages: [
		"better-auth",
		"@better-auth/expo",
		"@better-auth/core",
	],
};

export default nextConfig;

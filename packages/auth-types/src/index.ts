export interface BetterAuthUser {
	id: string;
	createdAt: Date;
	updatedAt: Date;
	email: string;
	emailVerified: boolean;
	name: string;
	image?: string | null;
}

export interface BetterAuthSessionMeta {
	id: string;
	createdAt: Date;
	updatedAt: Date;
	userId: string;
	expiresAt: Date;
	token: string;
	ipAddress?: string | null;
	userAgent?: string | null;
}

export interface BetterAuthSession {
	user: BetterAuthUser;
	session: BetterAuthSessionMeta;
}


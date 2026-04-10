import { getServerSession, type NextAuthOptions } from "next-auth";
import type { Account, Profile } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";

import { verifyPassword } from "@/lib/password";
import { findUserByEmail, upsertGitHubUserAccount } from "@/lib/user-store";

export const authOptions: NextAuthOptions = {
	session: {
		strategy: "jwt",
	},
	pages: {
		signIn: "/signin",
	},
	providers: [
		GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
			issuer: "https://github.com/login/oauth",
    }),
		CredentialsProvider({
			name: "Credentials",
			credentials: {
				email: {
					label: "Email",
					type: "email",
				},
				password: {
					label: "Password",
					type: "password",
				},
			},
			async authorize(credentials) {
				const email = credentials?.email?.trim().toLowerCase();
				const password = credentials?.password;

				if (!email || !password) {
					return null;
				}

				const user = await findUserByEmail(email);

				if (!user || !user.email || !user.passwordHash) {
					return null;
				}

				const passwordMatches = await verifyPassword(password, user.passwordHash);

				if (!passwordMatches) {
					return null;
				}

				return {
					id: String(user.id),
					name: user.name,
					email: user.email,
				};
			},
		}),
	],
	callbacks: {
		async signIn({ user, account, profile }) {
			if (account?.provider !== "github") {
				return true;
			}

			const githubAccount = account as Account;
			const githubProfile = profile as Profile | undefined;
			const refreshTokenExpiresInValue = (githubProfile as Record<string, unknown> | undefined)?.[
				"refresh_token_expires_in"
			];
			const refreshTokenExpiresIn =
				typeof refreshTokenExpiresInValue === "number" ? refreshTokenExpiresInValue : null;

			const dbUser = await upsertGitHubUserAccount({
				providerAccountId: githubAccount.providerAccountId,
				email: user.email,
				name: user.name,
				image: user.image,
				accessToken: githubAccount.access_token,
				refreshToken: githubAccount.refresh_token,
				expiresAt: githubAccount.expires_at,
				refreshTokenExpiresIn,
			});

			user.id = String(dbUser.id);
			user.name = dbUser.name;
			user.email = dbUser.email;
			user.image = dbUser.profilePhoto;

			return true;
		},
		async jwt({ token, user }) {
			if (user?.id) {
				token.sub = user.id;
			}

			return token;
		},
		async session({ session, token }) {
			if (session.user) {
				session.user.id = token.sub ?? session.user.id;
			}

			return session;
		},
	},
};

export function auth() {
	return getServerSession(authOptions);
}

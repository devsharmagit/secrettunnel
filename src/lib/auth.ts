import { getServerSession, type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { verifyPassword } from "@/lib/password";
import { findUserByEmail } from "@/lib/user-store";

export const authOptions: NextAuthOptions = {
	session: {
		strategy: "jwt",
	},
	pages: {
		signIn: "/signin",
	},
	providers: [
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

				if (!user) {
					return null;
				}

				const passwordMatches = await verifyPassword(password, user.passwordHash);

				if (!passwordMatches) {
					return null;
				}

				return {
					id: user.id,
					name: user.name,
					email: user.email,
				};
			},
		}),
	],
};

export function auth() {
	return getServerSession(authOptions);
}

/*
* Spotify Authentication Handeling
*/
import NextAuth from "next-auth";
import SpotifyProvider from "next-auth/providers/spotify";
import { JWT } from "next-auth/jwt"; // Import the JWT type

async function refreshAccessToken(token: JWT) { // Add type for token
    try {
        const url = "https://accounts.spotify.com/api/token";
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: `Basic ${Buffer.from(
                    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
                ).toString("base64")}`,
            },
            body: new URLSearchParams({
                grant_type: "refresh_token",
                refresh_token: token.refreshToken as string, // Ensure type safety
            }),
        });

        const refreshedTokens = await response.json();

        if (!response.ok) {
            throw refreshedTokens;
        }

        return {
            ...token,
            accessToken: refreshedTokens.access_token,
            accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000, // 1 hour
            refreshToken: refreshedTokens.refresh_token ?? token.refreshToken, // Fall back to old refresh token
        };
    } catch (error) {
        console.error("Error refreshing access token:", error);
        return {
            ...token,
            error: "RefreshAccessTokenError",
        };
    }
}

const handler = NextAuth({
    providers: [
        SpotifyProvider({
            clientId: process.env.SPOTIFY_CLIENT_ID!,
            clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
            authorization: "https://accounts.spotify.com/authorize?scope=user-read-recently-played,user-top-read,user-read-private",
        }),
    ],
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: "/login",
    },
    callbacks: {
        async jwt({ token, account }) {
            if (account) {
                token.accessToken = account.access_token;
                token.accessTokenExpires = Date.now() + (account.expires_in as number) * 1000; // Explicitly cast to number
                token.refreshToken = account.refresh_token;
            }

            if (Date.now() < (token.accessTokenExpires as number)) { // Explicitly cast to number
                return token;
            }

            return await refreshAccessToken(token);
        },
        async session({ session, token }: {session: any, token: JWT}) { // Explicitly type session and token
            session.accessToken = token.accessToken;
            session.error = token.error;
            return session;
        },
    },
});

export { handler as GET, handler as POST };


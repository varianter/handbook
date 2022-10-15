import NextAuth, { User } from 'next-auth';
import { AdapterUser } from 'next-auth/adapters';
import AzureADProvider from 'next-auth/providers/azure-ad';

export default NextAuth({
  providers: [
    AzureADProvider({
      // TO ENV
      clientId: process.env.AZURE_AD_CLIENT_ID ?? '',
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET ?? '',
      tenantId: process.env.AZURE_AD_TENANT_ID ?? '',

      idToken: true,

      async profile(profile, tokens) {
        const departmentResponse = await fetch(
          'https://graph.microsoft.com/v1.0/me/department/$value',
          {
            headers: {
              Authorization: `Bearer ${tokens.access_token}`,
            },
          },
        );

        const department = await departmentResponse.text();

        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          department,
        };
      },
    }),
  ],

  // TO ENV
  secret: process.env.JWT_COOKIE_SECRET,

  session: {
    strategy: 'jwt',
  },

  // Needed to get department from profile to session
  callbacks: {
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          department: token.department,
        },
      };
    },

    async jwt({ token, user }) {
      return {
        department: departmentFromPotentialUser(user),
        ...token,
      };
    },
  },
});

function departmentFromPotentialUser(user: User | AdapterUser | undefined) {
  if (!user) return undefined;
  return (user as any).department;
}

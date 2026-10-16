"use client";

import { AuthGuard } from "@/components/Auth/authGuard";
import { HomeListingsSection } from "@/components/HomeListingsSection";

// Client wrapper: AuthGuard uses a render-prop (function-as-children)
// pattern, which cannot cross the server/client component boundary.
// Keeping the gate in a client component lets the parent Home stay a
// Server Component so its markup is server-rendered for crawlers.
export default function HomeListingsGate() {
  return (
    <AuthGuard renderPrivate={false}>
      {(user) => <HomeListingsSection user={user} />}
    </AuthGuard>
  );
}

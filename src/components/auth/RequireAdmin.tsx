import * as React from "react";
import { Navigate } from "react-router-dom";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdmin } from "@/hooks/useAdmin";

type Props = {
  children: React.ReactNode;
};

export function RequireAdmin({ children }: Props) {
  const { loading, session, isAdmin } = useAdmin();

  if (loading) {
    return (
      <div className="container py-12">
        <Card className="mx-auto max-w-lg">
          <CardHeader>
            <CardTitle>Checking access…</CardTitle>
            <CardDescription>Please wait while we verify your session.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">Loading…</CardContent>
        </Card>
      </div>
    );
  }

  if (!session?.user) {
    return <Navigate to="/admin-login" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="container py-12">
        <Card className="mx-auto max-w-lg">
          <CardHeader>
            <CardTitle>Access denied</CardTitle>
            <CardDescription>You don’t have permission to view this page.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Please sign in with an authorized admin account.
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHero } from "@/components/site/PageHero";
import heroImage from "@/assets/module-forecast-daily.jpg";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { ADMIN_EMAIL } from "@/hooks/useAdmin";

const formSchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(200),
});

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    const parsed = formSchema.safeParse({ email, password });
    if (!parsed.success) {
      setError("Please enter a valid email and password.");
      return;
    }

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });

    if (signInError) {
      setError(signInError.message);
      return;
    }

    const signedInEmail = data.user?.email ?? "";
    if (signedInEmail.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      // Hard deny: only one authorized admin email.
      await supabase.auth.signOut();
      setError("Access denied for this account.");
      return;
    }

    navigate("/admin-dashboard");
  };

  return (
    <div>
      <PageHero
        title="Admin Login"
        subtitle="Login to manage daily forecasts and trading markets."
        imageSrc={heroImage}
        imageAlt="Forecast dashboard with candlestick charts"
      />

      <div className="container py-12">
        <Card className="mx-auto max-w-lg">
          <CardHeader>
            <CardTitle>Admin access</CardTitle>
            <CardDescription>Enter your credentials to continue.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label htmlFor="admin-email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="name@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="admin-password" className="text-sm font-medium">
                  Password
                </label>
                <Input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter password"
                  required
                />
              </div>
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              <Button type="submit" className="w-full rounded-full">
                Sign in
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminLogin;

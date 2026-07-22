import * as React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";

import { PageHero } from "@/components/site/PageHero";
import heroImage from "@/assets/module-forecast-daily.jpg";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";

const loginSchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(200),
});

const signupSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(200),
  country: z.string().trim().min(1).max(60),
  age: z.string().trim().min(1).max(20),
  profession: z.string().trim().min(1).max(80),
  code: z.string().trim().regex(/^\d{6,10}$/),
});

const signupDetailsSchema = signupSchema.omit({ code: true });

function useQueryParam(name: string) {
  const { search } = useLocation();
  return React.useMemo(() => new URLSearchParams(search).get(name), [search, name]);
}

export default function Auth() {
  const navigate = useNavigate();
  const mode = useQueryParam("mode");
  const defaultTab = mode === "signup" ? "signup" : "login";

  const [tab, setTab] = React.useState<string>(defaultTab);
  const [sessionChecked, setSessionChecked] = React.useState(false);

  React.useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) navigate("/");
    });

    supabase.auth.getSession().then(({ data }) => {
      setSessionChecked(true);
      if (data.session) navigate("/");
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  React.useEffect(() => setTab(defaultTab), [defaultTab]);

  const [loginEmail, setLoginEmail] = React.useState("");
  const [loginPassword, setLoginPassword] = React.useState("");
  const [loginError, setLoginError] = React.useState("");
  const [loginLoading, setLoginLoading] = React.useState(false);

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [country, setCountry] = React.useState("");
  const [age, setAge] = React.useState("");
  const [profession, setProfession] = React.useState("");
  const [codeSent, setCodeSent] = React.useState(false);
  const [code, setCode] = React.useState("");
  const [signupError, setSignupError] = React.useState("");
  const [signupLoading, setSignupLoading] = React.useState(false);
  const [signupSuccess, setSignupSuccess] = React.useState(false);

  const sendCode = async () => {
    setSignupError("");
    const parsed = signupDetailsSchema.safeParse({ name, email, password, country, age, profession });
    if (!parsed.success) {
      setSignupError("Please complete all signup details before requesting a verification code.");
      return;
    }

    setSignupLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: parsed.data.email,
        password: parsed.data.password,
        options: {
          data: {
            name: parsed.data.name,
            country: parsed.data.country,
            age: parsed.data.age,
            profession: parsed.data.profession,
          },
        },
      });
      if (error) throw new Error(error.message);
      setCodeSent(true);
    } catch (e: unknown) {
      setSignupError(e instanceof Error ? e.message : "Failed to send verification code.");
    } finally {
      setSignupLoading(false);
    }
  };

  const verifyAndCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    setSignupError("");
    setSignupSuccess(false);

    const parsed = signupSchema.safeParse({ name, email, password, country, age, profession, code });
    if (!parsed.success) {
      setSignupError("Please complete all fields and enter the verification code.");
      return;
    }

    setSignupLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: parsed.data.email,
        token: parsed.data.code,
        type: "email",
      });
      if (error) throw new Error(error.message);
      setSignupSuccess(true);
      setTab("login");
      setLoginEmail(parsed.data.email);
      setLoginPassword("");
    } catch (e: unknown) {
      setSignupError(e instanceof Error ? e.message : "Verification failed.");
    } finally {
      setSignupLoading(false);
    }
  };

  const signIn = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoginError("");

    const parsed = loginSchema.safeParse({ email: loginEmail, password: loginPassword });
    if (!parsed.success) {
      setLoginError("Please enter a valid email and password.");
      return;
    }

    setLoginLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: parsed.data.email,
        password: parsed.data.password,
      });
      if (error) throw new Error(error.message);
      navigate("/");
    } catch (e: unknown) {
      setLoginError(e instanceof Error ? e.message : "Sign in failed.");
    } finally {
      setLoginLoading(false);
    }
  };

  if (!sessionChecked) return null;

  return (
    <div>
      <PageHero
        title="Account"
        subtitle="Sign in or create an account to access member content."
        imageSrc={heroImage}
        imageAlt="Forecast dashboard with candlestick charts"
      />

      <div className="container py-12">
        <Card className="mx-auto max-w-lg">
          <CardHeader>
            <CardTitle>Welcome</CardTitle>
            <CardDescription>Use your email to sign in or verify a new account.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Sign in</TabsTrigger>
                <TabsTrigger value="signup">Sign up</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="mt-6">
                <form className="space-y-4" onSubmit={signIn}>
                  <div className="space-y-2">
                    <label htmlFor="login-email" className="text-sm font-medium">
                      Email
                    </label>
                    <Input
                      id="login-email"
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="login-password" className="text-sm font-medium">
                      Password
                    </label>
                    <Input
                      id="login-password"
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Your password"
                      required
                    />
                  </div>
                  {loginError ? <p className="text-sm text-destructive">{loginError}</p> : null}
                  <Button type="submit" className="w-full rounded-full" disabled={loginLoading}>
                    {loginLoading ? "Signing in…" : "Sign in"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="mt-6">
                <form className="space-y-4" onSubmit={verifyAndCreate}>
                  <div className="space-y-2">
                    <label htmlFor="signup-name" className="text-sm font-medium">
                      Name
                    </label>
                    <Input id="signup-name" value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="signup-email" className="text-sm font-medium">
                      Email
                    </label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <label htmlFor="signup-country" className="text-sm font-medium">
                        Country
                      </label>
                      <Input id="signup-country" value={country} onChange={(e) => setCountry(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="signup-age" className="text-sm font-medium">
                        Age
                      </label>
                      <Input id="signup-age" value={age} onChange={(e) => setAge(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="signup-profession" className="text-sm font-medium">
                        Profession
                      </label>
                      <Input
                        id="signup-profession"
                        value={profession}
                        onChange={(e) => setProfession(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="signup-password" className="text-sm font-medium">
                      Password
                    </label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a password"
                      required
                    />
                  </div>

                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full"
                    onClick={sendCode}
                    disabled={signupLoading}
                  >
                    {signupLoading ? "Sending…" : codeSent ? "Resend verification code" : "Send verification code"}
                  </Button>

                  {codeSent ? (
                    <div className="space-y-2">
                      <label htmlFor="signup-code" className="text-sm font-medium">
                        Verification code
                      </label>
                      <Input
                        id="signup-code"
                        inputMode="numeric"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="Enter email code"
                        required
                      />
                    </div>
                  ) : null}

                  {signupError ? <p className="text-sm text-destructive">{signupError}</p> : null}
                  {signupSuccess ? (
                    <p className="text-sm text-muted-foreground">Account created. Please sign in.</p>
                  ) : null}

                  <Button type="submit" className="w-full rounded-full" disabled={!codeSent || signupLoading}>
                    {signupLoading ? "Creating…" : "Verify & create account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

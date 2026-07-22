import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
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

function PasswordInput({
  id,
  value,
  onChange,
  placeholder,
  visible,
  onToggleVisible,
  autoComplete,
}: {
  id: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  visible: boolean;
  onToggleVisible: () => void;
  autoComplete?: string;
}) {
  return (
    <div className="relative">
      <Input
        id={id}
        type={visible ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="pr-10"
        required
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:bg-transparent hover:text-foreground"
        onClick={onToggleVisible}
        aria-label={visible ? "Hide password" : "Show password"}
      >
        {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </Button>
    </div>
  );
}

export default function Auth() {
  const navigate = useNavigate();
  const mode = useQueryParam("mode");
  const defaultTab = mode === "signup" ? "signup" : "login";

  const [tab, setTab] = React.useState<string>(defaultTab);
  const [sessionChecked, setSessionChecked] = React.useState(false);
  const [passwordRecovery, setPasswordRecovery] = React.useState(false);

  React.useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        setPasswordRecovery(true);
        setSessionChecked(true);
        return;
      }

      if (session && mode !== "reset") navigate("/");
    });

    supabase.auth.getSession().then(({ data }) => {
      setSessionChecked(true);
      if (data.session) {
        if (mode === "reset") {
          setPasswordRecovery(true);
          return;
        }
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [mode, navigate]);

  React.useEffect(() => setTab(defaultTab), [defaultTab]);

  const [loginEmail, setLoginEmail] = React.useState("");
  const [loginPassword, setLoginPassword] = React.useState("");
  const [loginError, setLoginError] = React.useState("");
  const [loginLoading, setLoginLoading] = React.useState(false);
  const [loginPasswordVisible, setLoginPasswordVisible] = React.useState(false);
  const [resetEmailMessage, setResetEmailMessage] = React.useState("");
  const [resetEmailLoading, setResetEmailLoading] = React.useState(false);

  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [newPasswordVisible, setNewPasswordVisible] = React.useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = React.useState(false);
  const [resetPasswordError, setResetPasswordError] = React.useState("");
  const [resetPasswordLoading, setResetPasswordLoading] = React.useState(false);

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
  const [signupPasswordVisible, setSignupPasswordVisible] = React.useState(false);

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
    } catch (error: unknown) {
      setSignupError(error instanceof Error ? error.message : "Failed to send verification code.");
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
    } catch (error: unknown) {
      setSignupError(error instanceof Error ? error.message : "Verification failed.");
    } finally {
      setSignupLoading(false);
    }
  };

  const signIn = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoginError("");
    setResetEmailMessage("");

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
    } catch (error: unknown) {
      setLoginError(error instanceof Error ? error.message : "Sign in failed.");
    } finally {
      setLoginLoading(false);
    }
  };

  const sendPasswordResetEmail = async () => {
    setLoginError("");
    setResetEmailMessage("");

    const parsedEmail = z.string().trim().email().safeParse(loginEmail);
    if (!parsedEmail.success) {
      setLoginError("Enter your email address first, then select Forgot password.");
      return;
    }

    setResetEmailLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(parsedEmail.data, {
        redirectTo: `${window.location.origin}/auth?mode=reset`,
      });
      if (error) throw new Error(error.message);
      setResetEmailMessage("Password reset email sent. Open the email and follow its link.");
    } catch (error: unknown) {
      setLoginError(error instanceof Error ? error.message : "Unable to send the password reset email.");
    } finally {
      setResetEmailLoading(false);
    }
  };

  const updatePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setResetPasswordError("");

    if (newPassword.length < 8) {
      setResetPasswordError("Your new password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setResetPasswordError("The two passwords do not match.");
      return;
    }

    setResetPasswordLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw new Error(error.message);
      await supabase.auth.signOut();
      setPasswordRecovery(false);
      setLoginPassword("");
      setResetEmailMessage("Password updated. You can now sign in with your new password.");
      navigate("/auth");
    } catch (error: unknown) {
      setResetPasswordError(error instanceof Error ? error.message : "Unable to update your password.");
    } finally {
      setResetPasswordLoading(false);
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
            <CardTitle>{passwordRecovery ? "Set a new password" : "Welcome"}</CardTitle>
            <CardDescription>
              {passwordRecovery
                ? "Choose a new password for your account."
                : "Use your email to sign in or verify a new account."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {passwordRecovery ? (
              <form className="space-y-4" onSubmit={updatePassword}>
                <div className="space-y-2">
                  <label htmlFor="new-password" className="text-sm font-medium">
                    New password
                  </label>
                  <PasswordInput
                    id="new-password"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    placeholder="Create a new password"
                    autoComplete="new-password"
                    visible={newPasswordVisible}
                    onToggleVisible={() => setNewPasswordVisible((visible) => !visible)}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="confirm-password" className="text-sm font-medium">
                    Confirm new password
                  </label>
                  <PasswordInput
                    id="confirm-password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="Confirm your new password"
                    autoComplete="new-password"
                    visible={confirmPasswordVisible}
                    onToggleVisible={() => setConfirmPasswordVisible((visible) => !visible)}
                  />
                </div>
                {resetPasswordError ? <p className="text-sm text-destructive">{resetPasswordError}</p> : null}
                <Button type="submit" className="w-full rounded-full" disabled={resetPasswordLoading}>
                  {resetPasswordLoading ? "Updating…" : "Update password"}
                </Button>
              </form>
            ) : (
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
                        onChange={(event) => setLoginEmail(event.target.value)}
                        placeholder="you@example.com"
                        autoComplete="email"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <label htmlFor="login-password" className="text-sm font-medium">
                          Password
                        </label>
                        <Button
                          type="button"
                          variant="link"
                          className="h-auto p-0 text-sm"
                          onClick={sendPasswordResetEmail}
                          disabled={resetEmailLoading}
                        >
                          {resetEmailLoading ? "Sending…" : "Forgot password?"}
                        </Button>
                      </div>
                      <PasswordInput
                        id="login-password"
                        value={loginPassword}
                        onChange={(event) => setLoginPassword(event.target.value)}
                        placeholder="Your password"
                        autoComplete="current-password"
                        visible={loginPasswordVisible}
                        onToggleVisible={() => setLoginPasswordVisible((visible) => !visible)}
                      />
                    </div>
                    {loginError ? <p className="text-sm text-destructive">{loginError}</p> : null}
                    {resetEmailMessage ? <p className="text-sm text-muted-foreground">{resetEmailMessage}</p> : null}
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
                      <Input id="signup-name" value={name} onChange={(event) => setName(event.target.value)} required />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="signup-email" className="text-sm font-medium">
                        Email
                      </label>
                      <Input
                        id="signup-email"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="you@example.com"
                        autoComplete="email"
                        required
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <label htmlFor="signup-country" className="text-sm font-medium">
                          Country
                        </label>
                        <Input id="signup-country" value={country} onChange={(event) => setCountry(event.target.value)} required />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="signup-age" className="text-sm font-medium">
                          Age
                        </label>
                        <Input id="signup-age" value={age} onChange={(event) => setAge(event.target.value)} required />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="signup-profession" className="text-sm font-medium">
                          Profession
                        </label>
                        <Input
                          id="signup-profession"
                          value={profession}
                          onChange={(event) => setProfession(event.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="signup-password" className="text-sm font-medium">
                        Password
                      </label>
                      <PasswordInput
                        id="signup-password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="Create a password"
                        autoComplete="new-password"
                        visible={signupPasswordVisible}
                        onToggleVisible={() => setSignupPasswordVisible((visible) => !visible)}
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
                          onChange={(event) => setCode(event.target.value)}
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
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

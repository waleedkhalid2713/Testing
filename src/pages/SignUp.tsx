import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHero } from "@/components/site/PageHero";
import heroImage from "@/assets/module-forecast-daily.jpg";

const USER_KEY = "epic-trader-user";
const USERS_KEY = "epic-trader-users";

const TEMP_EMAIL_DOMAINS = new Set([
  "10minutemail.com",
  "tempmail.com",
  "mailinator.com",
  "guerrillamail.com",
  "yopmail.com",
  "throwawaymail.com",
  "tempmail.net",
  "fakeinbox.com",
  "disposablemail.com",
  "maildrop.cc",
]);

const SignUp = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [country, setCountry] = useState("");
  const [age, setAge] = useState("");
  const [profession, setProfession] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [enteredCode, setEnteredCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const emailDomain = useMemo(() => email.split("@")[1]?.toLowerCase() ?? "", [email]);

  const handleSendCode = () => {
    setError("");
    if (!emailDomain || TEMP_EMAIL_DOMAINS.has(emailDomain)) {
      setError("Please use a valid email address from a trusted domain.");
      return;
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setVerificationCode(code);
    setCodeSent(true);
  };

  const handleVerify = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    if (!codeSent) {
      setError("Please request a verification code.");
      return;
    }
    if (enteredCode !== verificationCode) {
      setError("Invalid verification code. Please check your email.");
      return;
    }

    const storedUsers = window.localStorage.getItem(USERS_KEY);
    const users = storedUsers ? (JSON.parse(storedUsers) as Array<Record<string, string>>) : [];
    const updatedUsers = [
      ...users.filter((u) => u.email !== email),
      {
        name,
        email,
        password,
        verified: "true",
        country,
        age,
        profession,
      },
    ];

    window.localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
    window.localStorage.setItem(USER_KEY, "true");
    navigate("/");
  };

  return (
    <div>
      <PageHero
        title="Create an Account"
        subtitle="Sign up to access modules and daily forecasts."
        imageSrc={heroImage}
        imageAlt="Forecast dashboard with candlestick charts"
      />

      <div className="container py-12">
        <Card className="mx-auto max-w-lg">
          <CardHeader>
            <CardTitle>Sign up</CardTitle>
            <CardDescription>Get access to Epic Trader modules.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleVerify}>
              <div className="space-y-2">
                <label htmlFor="signup-name" className="text-sm font-medium">
                  Name
                </label>
                <Input
                  id="signup-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Your name"
                  required
                />
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
                  required
                />
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <label htmlFor="signup-country" className="text-sm font-medium">
                    Country
                  </label>
                  <Input
                    id="signup-country"
                    value={country}
                    onChange={(event) => setCountry(event.target.value)}
                    placeholder="Country"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="signup-age" className="text-sm font-medium">
                    Age
                  </label>
                  <Input
                    id="signup-age"
                    value={age}
                    onChange={(event) => setAge(event.target.value)}
                    placeholder="Age"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="signup-profession" className="text-sm font-medium">
                    Profession
                  </label>
                  <Input
                    id="signup-profession"
                    value={profession}
                    onChange={(event) => setProfession(event.target.value)}
                    placeholder="Profession"
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
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Create a password"
                  required
                />
              </div>
              <Button type="button" variant="secondary" className="w-full" onClick={handleSendCode}>
                Send verification code
              </Button>
              {codeSent ? (
                <div className="space-y-2">
                  <label htmlFor="signup-code" className="text-sm font-medium">
                    Verification code
                  </label>
                  <Input
                    id="signup-code"
                    value={enteredCode}
                    onChange={(event) => setEnteredCode(event.target.value)}
                    placeholder="Enter the code sent to your email"
                    required
                  />
                </div>
              ) : null}
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              <Button type="submit" className="w-full rounded-full">
                Verify &amp; create account
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SignUp;

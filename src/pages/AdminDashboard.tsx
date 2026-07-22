import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/site/PageHero";
import heroImage from "@/assets/module-forecast-daily.jpg";
import { supabase } from "@/integrations/supabase/client";

type Profile = {
  id: string;
  email: string;
  incorporated_at: string;
  region: string;
  forecast_disclaimer_accepted_at: string | null;
};

type ActivityEvent = {
  id: string;
  page: string;
  region: string;
  visited_at: string;
};

type Period = "7" | "30" | "90" | "all";

const formatDate = (value: string) =>
  new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

const pageLabel = (page: string) => {
  if (page === "/") {
    return "Home";
  }

  return page
    .split("/")
    .filter(Boolean)
    .map((segment) => segment.replace(/-/g, " "))
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" / ");
};

const dateLabel = (value: string) =>
  new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(new Date(value));

const csvCell = (value: string | number) => {
  const text = String(value);
  const safeText = /^[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${safeText.replace(/"/g, '""')}"`;
};

const downloadCsv = (fileName: string, headers: string[], rows: Array<Array<string | number>>) => {
  const content = [headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
  const file = new Blob([`\uFEFF${content}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
};

const AdminDashboard = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activity, setActivity] = useState<ActivityEvent[]>([]);
  const [region, setRegion] = useState("all");
  const [period, setPeriod] = useState<Period>("30");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      const [profilesResponse, activityResponse] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, email, incorporated_at, region, forecast_disclaimer_accepted_at")
          .order("incorporated_at", { ascending: false }),
        supabase
          .from("user_activity_events")
          .select("id, page, region, visited_at")
          .order("visited_at", { ascending: false }),
      ]);

      const messages = [profilesResponse.error?.message, activityResponse.error?.message].filter(Boolean);
      if (messages.length) {
        setError(messages.join(" "));
      } else {
        setProfiles(profilesResponse.data);
        setActivity(activityResponse.data);
      }

      setLoading(false);
    };

    void loadDashboard();
  }, []);

  const regions = useMemo(
    () => Array.from(new Set([...profiles, ...activity].map((item) => item.region))).sort(),
    [profiles, activity],
  );

  const filteredActivity = useMemo(() => {
    const cutoff = new Date();
    if (period !== "all") {
      cutoff.setDate(cutoff.getDate() - Number(period));
    }

    return activity.filter((event) => {
      const matchesRegion = region === "all" || event.region === region;
      const matchesPeriod = period === "all" || new Date(event.visited_at) >= cutoff;
      return matchesRegion && matchesPeriod;
    });
  }, [activity, period, region]);

  const filteredProfiles = useMemo(
    () => profiles.filter((profile) => region === "all" || profile.region === region),
    [profiles, region],
  );

  const pageVisits = useMemo(() => {
    const counts = new Map<string, number>();

    filteredActivity.forEach((event) => {
      counts.set(event.page, (counts.get(event.page) ?? 0) + 1);
    });

    return Array.from(counts, ([page, visits]) => ({
      page: pageLabel(page),
      visits,
    }))
      .sort((first, second) => second.visits - first.visits)
      .slice(0, 8);
  }, [filteredActivity]);

  const visitsByDay = useMemo(() => {
    const counts = new Map<string, { label: string; visits: number }>();

    filteredActivity
      .slice()
      .reverse()
      .forEach((event) => {
        const day = new Date(event.visited_at).toISOString().slice(0, 10);
        const existing = counts.get(day);
        counts.set(day, {
          label: dateLabel(event.visited_at),
          visits: (existing?.visits ?? 0) + 1,
        });
      });

    return Array.from(counts.values());
  }, [filteredActivity]);

  const topPage = pageVisits[0]?.page ?? "No activity yet";

  const exportUsers = () => {
    downloadCsv(
      "epic-trader-users.csv",
      ["Email of User", "Date of Incorporation", "Region", "Forecast Disclaimer Accepted"],
      filteredProfiles.map((profile) => [
        profile.email,
        formatDate(profile.incorporated_at),
        profile.region,
        profile.forecast_disclaimer_accepted_at ? formatDate(profile.forecast_disclaimer_accepted_at) : "Not accepted",
      ]),
    );
  };

  const exportActivity = () => {
    downloadCsv(
      "epic-trader-activity.csv",
      ["Page", "Region", "Visited At"],
      filteredActivity.map((event) => [
        pageLabel(event.page),
        event.region,
        formatDate(event.visited_at),
      ]),
    );
  };

  return (
    <div>
      <PageHero
        title="Admin Dashboard"
        subtitle="Analyze registered users and their website activity."
        imageSrc={heroImage}
        imageAlt="Forecast dashboard with candlestick charts"
      />

      <div className="container py-12 space-y-6">
        <Card className="border-primary/40">
          <CardHeader>
            <CardTitle>Daily Forecast Management</CardTitle>
            <CardDescription>Upload a TradingView image, let AI fill the trade values, and publish the forecast.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="rounded-full">
              <Link to="/daily-forecast">Open Daily Forecast Admin</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activity filters</CardTitle>
            <CardDescription>Use these filters to focus your analysis.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm font-medium">
              Region
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={region}
                onChange={(event) => setRegion(event.target.value)}
              >
                <option value="all">All regions</option>
                {regions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2 text-sm font-medium">
              Time period
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={period}
                onChange={(event) => setPeriod(event.target.value as Period)}
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="all">All time</option>
              </select>
            </label>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Registered users</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{filteredProfiles.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Page visits</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{filteredActivity.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Most visited option</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-semibold">{topPage}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Export data</CardTitle>
            <CardDescription>Download CSV files that open directly in Microsoft Excel.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button type="button" variant="secondary" onClick={exportUsers} disabled={!filteredProfiles.length}>
              Export users CSV
            </Button>
            <Button type="button" variant="secondary" onClick={exportActivity} disabled={!filteredActivity.length}>
              Export filtered activity CSV
            </Button>
          </CardContent>
        </Card>

        {loading ? <p className="text-sm text-muted-foreground">Loading dashboard…</p> : null}
        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        {!loading && !error ? (
          <>
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Most visited options</CardTitle>
                  <CardDescription>Page views in the selected period.</CardDescription>
                </CardHeader>
                <CardContent className="h-[320px]">
                  {pageVisits.length ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={pageVisits} margin={{ top: 12, right: 12, left: -16, bottom: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="page" tick={{ fontSize: 12 }} interval={0} angle={-20} textAnchor="end" height={72} />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="visits" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-sm text-muted-foreground">No page visits match these filters.</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Visits over time</CardTitle>
                  <CardDescription>Daily page views in the selected period.</CardDescription>
                </CardHeader>
                <CardContent className="h-[320px]">
                  {visitsByDay.length ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={visitsByDay} margin={{ top: 12, right: 12, left: -16, bottom: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Line type="monotone" dataKey="visits" stroke="hsl(var(--primary))" strokeWidth={3} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-sm text-muted-foreground">No page visits match these filters.</p>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Registered users</CardTitle>
                <CardDescription>Email, signup date, region, and forecast disclaimer acceptance.</CardDescription>
              </CardHeader>
              <CardContent className="overflow-auto">
                <table className="w-full min-w-[560px] text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="py-3 pr-4">Email of User</th>
                      <th className="py-3 pr-4">Date of Incorporation</th>
                      <th className="py-3 pr-4">Region</th>
                      <th className="py-3">Forecast Disclaimer</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProfiles.length ? (
                      filteredProfiles.map((profile) => (
                        <tr key={profile.id} className="border-b">
                          <td className="py-3 pr-4">{profile.email}</td>
                          <td className="py-3 pr-4">{formatDate(profile.incorporated_at)}</td>
                          <td className="py-3 pr-4">{profile.region}</td>
                          <td className="py-3">{profile.forecast_disclaimer_accepted_at ? `Accepted ${formatDate(profile.forecast_disclaimer_accepted_at)}` : "Not accepted"}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-5 text-muted-foreground">
                          No registered users yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default AdminDashboard;
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
import { Ban, Download, Reply, Trash2 } from "lucide-react";

import { BootcampManagement } from "@/components/admin/BootcampManagement";
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

type ContactMessage = {
  id: string;
  name: string;
  email: string;
  subject: string;
  category: string;
  message: string;
  status: string;
  created_at: string;
};

type Period = "7" | "30" | "90" | "all";
type MessageStatusFilter = "all" | "Unread" | "In progress" | "Resolved";

const supportStatuses = ["Unread", "In progress", "Resolved"] as const;

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
  const [supportMessages, setSupportMessages] = useState<ContactMessage[]>([]);
  const [messageStatusFilter, setMessageStatusFilter] = useState<MessageStatusFilter>("all");
  const [updatingMessageId, setUpdatingMessageId] = useState<string | null>(null);
  const [managingUserId, setManagingUserId] = useState<string | null>(null);
  const [userActionMessage, setUserActionMessage] = useState("");
  const [region, setRegion] = useState("all");
  const [period, setPeriod] = useState<Period>("30");
  const [error, setError] = useState("");
  const [supportError, setSupportError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      setError("");
      setSupportError("");

      try {
        const [profilesResponse, activityResponse, contactMessagesResponse] = await Promise.all([
          supabase
            .from("profiles")
            .select("id, email, incorporated_at, region, forecast_disclaimer_accepted_at")
            .order("incorporated_at", { ascending: false }),
          supabase
            .from("user_activity_events")
            .select("id, page, region, visited_at")
            .order("visited_at", { ascending: false }),
          supabase
            .from("contact_messages")
            .select("id, name, email, subject, category, message, status, created_at")
            .order("created_at", { ascending: false }),
        ]);

        const dashboardErrors = [profilesResponse.error?.message, activityResponse.error?.message].filter(Boolean);
        if (dashboardErrors.length) {
          setError(dashboardErrors.join(" "));
        } else {
          setProfiles(profilesResponse.data ?? []);
          setActivity(activityResponse.data ?? []);
        }

        if (contactMessagesResponse.error) {
          setSupportError(contactMessagesResponse.error.message);
        } else {
          setSupportMessages(contactMessagesResponse.data ?? []);
        }
      } catch {
        setError("The dashboard could not be loaded. Please refresh and try again.");
      } finally {
        setLoading(false);
      }
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

  const filteredSupportMessages = useMemo(
    () =>
      supportMessages.filter(
        (message) => messageStatusFilter === "all" || message.status === messageStatusFilter,
      ),
    [messageStatusFilter, supportMessages],
  );

  const unreadSupportMessages = useMemo(
    () => supportMessages.filter((message) => message.status === "Unread").length,
    [supportMessages],
  );

  const updateMessageStatus = async (messageId: string, status: (typeof supportStatuses)[number]) => {
    setUpdatingMessageId(messageId);
    const { error: updateError } = await supabase
      .from("contact_messages")
      .update({ status })
      .eq("id", messageId);

    if (updateError) {
      setSupportError(updateError.message);
    } else {
      setSupportMessages((current) =>
        current.map((message) => (message.id === messageId ? { ...message, status } : message)),
      );
    }

    setUpdatingMessageId(null);
  };

  const replyToSupportMessage = (message: ContactMessage) => {
    const search = new URLSearchParams({
      view: "cm",
      fs: "1",
      to: message.email,
      su: `Re: [Epic Trader] ${message.subject}`,
      body: `Hello ${message.name},\n\nThank you for contacting Epic Trader Support.\n\n`,
    });

    window.open(`https://mail.google.com/mail/u/0/?${search.toString()}`, "_blank", "noopener,noreferrer");

    if (message.status === "Unread") {
      void updateMessageStatus(message.id, "In progress");
    }
  };

  const manageUserAccount = async (profile: Profile, action: "block" | "delete") => {
    const actionLabel = action === "block" ? "block" : "permanently delete";
    const confirmed = window.confirm(
      `Are you sure you want to ${actionLabel} ${profile.email}? This action cannot be undone for a deleted account.`,
    );

    if (!confirmed) {
      return;
    }

    setManagingUserId(profile.id);
    setUserActionMessage("");

    const { error: manageError } = await supabase.functions.invoke("manage-user-account", {
      body: { userId: profile.id, action },
    });

    if (manageError) {
      setUserActionMessage(manageError.message || `The user could not be ${actionLabel}.`);
    } else if (action === "delete") {
      setProfiles((current) => current.filter((user) => user.id !== profile.id));
      setUserActionMessage(`${profile.email} was deleted.`);
    } else {
      setUserActionMessage(`${profile.email} was blocked and can no longer sign in.`);
    }

    setManagingUserId(null);
  };

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

  const exportSupportMessages = () => {
    downloadCsv(
      "epic-trader-support-messages.csv",
      ["Received", "Name", "Email", "Subject", "Category", "Message", "Status"],
      filteredSupportMessages.map((message) => [
        formatDate(message.created_at),
        message.name,
        message.email,
        message.subject,
        message.category,
        message.message,
        message.status,
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

        <BootcampManagement />

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
          <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
            <div className="space-y-1.5">
              <CardTitle>Support inbox</CardTitle>
              <CardDescription>
                Review customer messages and update their status. {unreadSupportMessages} unread message{unreadSupportMessages === 1 ? "" : "s"}.
              </CardDescription>
            </div>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              aria-label="Export support messages as CSV"
              title="Export support messages"
              disabled={!filteredSupportMessages.length}
              onClick={exportSupportMessages}
            >
              <Download className="size-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="block max-w-xs space-y-2 text-sm font-medium">
              Message status
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={messageStatusFilter}
                onChange={(event) => setMessageStatusFilter(event.target.value as MessageStatusFilter)}
              >
                <option value="all">All messages</option>
                {supportStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>

            {supportError ? (
              <p className="text-sm text-destructive">
                Support inbox is unavailable: {supportError}
              </p>
            ) : null}

            <div className="overflow-auto">
              <table className="w-full min-w-[820px] text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="py-3 pr-4">Received</th>
                    <th className="py-3 pr-4">Sender</th>
                    <th className="py-3 pr-4">Message</th>
                    <th className="py-3 pr-4">Status</th>
                    <th className="py-3 text-right">Reply</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSupportMessages.length ? (
                    filteredSupportMessages.map((message) => (
                      <tr key={message.id} className="border-b align-top">
                        <td className="py-3 pr-4 text-muted-foreground">{formatDate(message.created_at)}</td>
                        <td className="py-3 pr-4">
                          <p className="font-medium">{message.name}</p>
                          <a className="text-muted-foreground hover:text-primary hover:underline" href={`mailto:${message.email}`}>
                            {message.email}
                          </a>
                        </td>
                        <td className="max-w-md py-3 pr-4">
                          <p className="font-medium">{message.subject}</p>
                          <p className="mt-1 text-xs font-medium uppercase tracking-wide text-primary">{message.category}</p>
                          <p className="mt-2 whitespace-pre-wrap text-muted-foreground">{message.message}</p>
                        </td>
                        <td className="py-3">
                          <select
                            className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                            value={message.status}
                            disabled={updatingMessageId === message.id}
                            onChange={(event) =>
                              void updateMessageStatus(
                                message.id,
                                event.target.value as (typeof supportStatuses)[number],
                              )
                            }
                          >
                            {supportStatuses.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-3 text-right">
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            aria-label={`Reply to ${message.name}`}
                            title="Open Gmail and mark in progress"
                            disabled={updatingMessageId === message.id}
                            onClick={() => replyToSupportMessage(message)}
                          >
                            <Reply className="size-4" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-5 text-muted-foreground">
                        No support messages match this filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
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
              <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
                <div className="space-y-1.5">
                  <CardTitle>Registered users</CardTitle>
                  <CardDescription>Email, signup date, region, forecast disclaimer acceptance, and account controls.</CardDescription>
                  {userActionMessage ? <p className="text-sm text-muted-foreground">{userActionMessage}</p> : null}
                </div>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  aria-label="Export registered users as CSV"
                  title="Export registered users"
                  disabled={!filteredProfiles.length}
                  onClick={exportUsers}
                >
                  <Download className="size-4" />
                </Button>
              </CardHeader>
              <CardContent className="overflow-auto">
                <table className="w-full min-w-[760px] text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="py-3 pr-4">Email of User</th>
                      <th className="py-3 pr-4">Date of Incorporation</th>
                      <th className="py-3 pr-4">Region</th>
                      <th className="py-3 pr-4">Forecast Disclaimer</th>
                      <th className="py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProfiles.length ? (
                      filteredProfiles.map((profile) => (
                        <tr key={profile.id} className="border-b">
                          <td className="py-3 pr-4">{profile.email}</td>
                          <td className="py-3 pr-4">{formatDate(profile.incorporated_at)}</td>
                          <td className="py-3 pr-4">{profile.region}</td>
                          <td className="py-3 pr-4">{profile.forecast_disclaimer_accepted_at ? `Accepted ${formatDate(profile.forecast_disclaimer_accepted_at)}` : "Not accepted"}</td>
                          <td className="py-3 text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                disabled={managingUserId === profile.id}
                                onClick={() => void manageUserAccount(profile, "block")}
                              >
                                <Ban className="size-4" />
                                Block
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="destructive"
                                disabled={managingUserId === profile.id}
                                onClick={() => void manageUserAccount(profile, "delete")}
                              >
                                <Trash2 className="size-4" />
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-5 text-muted-foreground">
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
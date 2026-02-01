import { useMemo, useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHero } from "@/components/site/PageHero";
import heroImage from "@/assets/module-forecast-daily.jpg";

const USERS_KEY = "epic-trader-users";
const VISITS_KEY = "epic-trader-visits";
const CONTENT_KEY = "epic-trader-content-metrics";
const FORECAST_KEY = "epic-trader-forecast-store";

type UserRecord = {
  name: string;
  email: string;
  password: string;
  verified: string;
  country?: string;
  age?: string;
  profession?: string;
};

type VisitRecord = {
  id: string;
  timestamp: string;
  country?: string;
  age?: string;
  profession?: string;
  page?: string;
};

type ContentMetric = {
  key: string;
  label: string;
  clicks: number;
};

type ForecastStore = {
  markets: Array<{ id: string; name: string; pairs: string[] }>;
  forecasts: Array<{ id: string; result?: string }>;
};

const AdminDashboard = () => {
  const storedUsers = window.localStorage.getItem(USERS_KEY);
  const users = storedUsers ? (JSON.parse(storedUsers) as UserRecord[]) : [];
  const storedVisits = window.localStorage.getItem(VISITS_KEY);
  const visits = storedVisits ? (JSON.parse(storedVisits) as VisitRecord[]) : [];
  const storedContent = window.localStorage.getItem(CONTENT_KEY);
  const content = storedContent ? (JSON.parse(storedContent) as ContentMetric[]) : [];
  const storedForecasts = window.localStorage.getItem(FORECAST_KEY);
  const forecastStore = storedForecasts ? (JSON.parse(storedForecasts) as ForecastStore) : { markets: [], forecasts: [] };

  const [filterCountry, setFilterCountry] = useState("");
  const [filterAge, setFilterAge] = useState("");
  const [filterProfession, setFilterProfession] = useState("");

  const filteredUsers = useMemo(
    () =>
      users.filter((user) => {
        if (filterCountry && user.country !== filterCountry) {
          return false;
        }
        if (filterAge && user.age !== filterAge) {
          return false;
        }
        if (filterProfession && user.profession !== filterProfession) {
          return false;
        }
        return true;
      }),
    [users, filterCountry, filterAge, filterProfession],
  );

  const filteredVisits = useMemo(
    () =>
      visits.filter((visit) => {
        if (filterCountry && visit.country !== filterCountry) {
          return false;
        }
        if (filterAge && visit.age !== filterAge) {
          return false;
        }
        if (filterProfession && visit.profession !== filterProfession) {
          return false;
        }
        return true;
      }),
    [visits, filterCountry, filterAge, filterProfession],
  );

  const totalForecasts = forecastStore.forecasts.length;
  const completedResults = forecastStore.forecasts.filter((forecast) => forecast.result?.trim()).length;

  return (
    <div>
      <PageHero
        title="Admin Dashboard"
        subtitle="Monitor users, visits, forecasts, and content performance."
        imageSrc={heroImage}
        imageAlt="Forecast dashboard with candlestick charts"
      />

      <div className="container py-12 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Global filters</CardTitle>
            <CardDescription>Filter analytics by user profile attributes.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <Input placeholder="Country" value={filterCountry} onChange={(e) => setFilterCountry(e.target.value)} />
            <Input placeholder="Age" value={filterAge} onChange={(e) => setFilterAge(e.target.value)} />
            <Input
              placeholder="Profession"
              value={filterProfession}
              onChange={(e) => setFilterProfession(e.target.value)}
            />
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Total users</CardTitle>
              <CardDescription>Verified accounts</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{filteredUsers.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Total visits</CardTitle>
              <CardDescription>Filtered by attributes</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{filteredVisits.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Forecast results</CardTitle>
              <CardDescription>Completed vs total</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">
                {completedResults}/{totalForecasts}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Users table</CardTitle>
            <CardDescription>Admin-only visibility of user accounts.</CardDescription>
          </CardHeader>
          <CardContent className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2">Name</th>
                  <th>Email</th>
                  <th>Country</th>
                  <th>Age</th>
                  <th>Profession</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length ? (
                  filteredUsers.map((user) => (
                    <tr key={user.email} className="border-b">
                      <td className="py-2">{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.country || "-"}</td>
                      <td>{user.age || "-"}</td>
                      <td>{user.profession || "-"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-4 text-muted-foreground">
                      No users match the current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Content performance</CardTitle>
            <CardDescription>Which modules attract the most interest.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {content.length ? (
              content.map((item) => (
                <div key={item.key} className="flex items-center justify-between rounded-md border px-3 py-2">
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-sm text-muted-foreground">{item.clicks} clicks</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No content engagement recorded yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;

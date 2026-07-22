import { useEffect, useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHero } from "@/components/site/PageHero";
import heroImage from "@/assets/module-forecast-daily.jpg";
import { supabase } from "@/integrations/supabase/client";

type Profile = {
  id: string;
  email: string;
  incorporated_at: string;
  region: string;
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

const AdminDashboard = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfiles = async () => {
      const { data, error: profilesError } = await supabase
        .from("profiles")
        .select("id, email, incorporated_at, region")
        .order("incorporated_at", { ascending: false });

      if (profilesError) {
        setError(profilesError.message);
      } else {
        setProfiles(data);
      }

      setLoading(false);
    };

    void loadProfiles();
  }, []);

  return (
    <div>
      <PageHero
        title="Admin Dashboard"
        subtitle="View verified website accounts."
        imageSrc={heroImage}
        imageAlt="Forecast dashboard with candlestick charts"
      />

      <div className="container py-12 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Registered users</CardTitle>
            <CardDescription>Total verified accounts: {profiles.length}</CardDescription>
          </CardHeader>
          <CardContent className="overflow-auto">
            {loading ? <p className="text-sm text-muted-foreground">Loading users…</p> : null}
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            {!loading && !error ? (
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="py-3 pr-4">Email of User</th>
                    <th className="py-3 pr-4">Date of Incorporation</th>
                    <th className="py-3">Region</th>
                  </tr>
                </thead>
                <tbody>
                  {profiles.length ? (
                    profiles.map((profile) => (
                      <tr key={profile.id} className="border-b">
                        <td className="py-3 pr-4">{profile.email}</td>
                        <td className="py-3 pr-4">{formatDate(profile.incorporated_at)}</td>
                        <td className="py-3">{profile.region}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="py-5 text-muted-foreground">
                        No verified users yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;

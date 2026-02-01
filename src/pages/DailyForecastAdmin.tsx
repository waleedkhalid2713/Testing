import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/site/Reveal";
import heroImage from "@/assets/module-forecast-daily.jpg";

const DailyForecastAdmin = () => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  return (
    <div>
      <PageHero
        title="Daily Forecast Admin"
        subtitle="Upload the latest forecast image and add Structure, POI, and supporting notes."
        imageSrc={heroImage}
        imageAlt="Forecast dashboard with candlestick charts"
      />

      <div className="container py-12">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Reveal>
            <Card className="hover-glow">
              <CardHeader>
                <CardTitle>Daily forecast upload</CardTitle>
                <CardDescription>Provide the image and key context that traders need.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="forecast-image">
                    Forecast image
                  </label>
                  <Input
                    id="forecast-image"
                    type="file"
                    accept="image/*"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) {
                        setPreviewUrl(URL.createObjectURL(file));
                      }
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="structure-notes">
                    Structure
                  </label>
                  <Textarea
                    id="structure-notes"
                    placeholder="Describe market structure, bias, and key levels."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="poi-notes">
                    POI (Points of Interest)
                  </label>
                  <Textarea id="poi-notes" placeholder="Highlight POIs, liquidity zones, and timing windows." rows={4} />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="extra-notes">
                    Additional notes
                  </label>
                  <Textarea
                    id="extra-notes"
                    placeholder="Risk plan, invalidation rules, and session notes."
                    rows={4}
                  />
                </div>

                <Button type="button" className="rounded-full px-6">
                  Save forecast
                </Button>
              </CardContent>
            </Card>
          </Reveal>

          <Reveal delayMs={120}>
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle>Preview</CardTitle>
                <CardDescription>Uploaded image preview.</CardDescription>
              </CardHeader>
              <CardContent>
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Daily forecast preview"
                    className="h-64 w-full rounded-xl object-cover"
                  />
                ) : (
                  <div className="flex h-64 items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground">
                    Upload an image to see the preview here.
                  </div>
                )}
              </CardContent>
            </Card>
          </Reveal>
        </div>
      </div>
    </div>
  );
};

export default DailyForecastAdmin;

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/site/Reveal";
import heroImage from "@/assets/module-forecast-daily.jpg";

type SavedForecast = {
  imageDataUrl?: string;
  structure?: string;
  poi?: string;
  notes?: string;
  savedAt?: string;
};

const STORAGE_KEY = "epic-trader-daily-forecast";

const DailyForecastAdmin = () => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [structure, setStructure] = useState("");
  const [poi, setPoi] = useState("");
  const [notes, setNotes] = useState("");
  const [savedForecast, setSavedForecast] = useState<SavedForecast | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as SavedForecast;
      setSavedForecast(parsed);
      if (parsed.imageDataUrl) {
        setPreviewUrl(parsed.imageDataUrl);
      }
      setStructure(parsed.structure ?? "");
      setPoi(parsed.poi ?? "");
      setNotes(parsed.notes ?? "");
    }
  }, []);

  const handleSave = async () => {
    let imageDataUrl = savedForecast?.imageDataUrl;

    if (imageFile) {
      imageDataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("Unable to read file"));
        reader.readAsDataURL(imageFile);
      });
    }

    const payload: SavedForecast = {
      imageDataUrl,
      structure,
      poi,
      notes,
      savedAt: new Date().toISOString(),
    };

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    setSavedForecast(payload);
  };

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
                <CardDescription>
                  Provide the image and key context that traders need. Saved forecasts appear below.
                </CardDescription>
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
                        setImageFile(file);
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
                    value={structure}
                    onChange={(event) => setStructure(event.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="poi-notes">
                    POI (Points of Interest)
                  </label>
                  <Textarea
                    id="poi-notes"
                    placeholder="Highlight POIs, liquidity zones, and timing windows."
                    rows={4}
                    value={poi}
                    onChange={(event) => setPoi(event.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="extra-notes">
                    Additional notes
                  </label>
                  <Textarea
                    id="extra-notes"
                    placeholder="Risk plan, invalidation rules, and session notes."
                    rows={4}
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                  />
                </div>

                <Button type="button" className="rounded-full px-6" onClick={handleSave}>
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

        <Reveal delayMs={180}>
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Live forecast (website)</CardTitle>
              <CardDescription>
                This is what visitors will see after you save today’s forecast.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold">Structure</p>
                  <p className="text-sm text-muted-foreground">
                    {savedForecast?.structure || "No structure notes saved yet."}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold">POI</p>
                  <p className="text-sm text-muted-foreground">
                    {savedForecast?.poi || "No POI notes saved yet."}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold">Additional notes</p>
                  <p className="text-sm text-muted-foreground">
                    {savedForecast?.notes || "No additional notes saved yet."}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {savedForecast?.savedAt ? `Last saved ${new Date(savedForecast.savedAt).toLocaleString()}` : ""}
                </p>
              </div>
              <div>
                {savedForecast?.imageDataUrl ? (
                  <img
                    src={savedForecast.imageDataUrl}
                    alt="Saved daily forecast"
                    className="h-64 w-full rounded-xl object-cover"
                  />
                ) : (
                  <div className="flex h-64 items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground">
                    Save a forecast to show it here.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </Reveal>
      </div>
    </div>
  );
};

export default DailyForecastAdmin;

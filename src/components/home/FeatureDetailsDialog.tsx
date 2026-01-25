import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { FeatureKey } from "@/components/home/features";
import { featureDetails } from "@/components/home/features";

export function FeatureDetailsDialog({
  open,
  onOpenChange,
  active,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  active: FeatureKey;
}) {
  const details = featureDetails[active];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{details.title}</DialogTitle>
          <DialogDescription>{details.description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">{details.body}</p>
          <div className="flex gap-2">
            <Button asChild size="sm">
              <a href={active === "bootcamp" ? "/bootcamp" : "/resources"}>Learn more</a>
            </Button>
            <Button asChild size="sm" variant="outline">
              <a href="/contact">Book a Call</a>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { cn } from "@/lib/utils";
import { Loader2Icon } from "lucide-react";
import React from "react";

function Terrain2DCard({
  label,
  tileImgUrl,
  loading,
  className,
}: {
  label: string;
  tileImgUrl: string;
  loading?: boolean;
  className?: string;
}) {
  if (loading || !tileImgUrl)
    return (
      <div className={cn("relative rounded-md bg-muted grid place-content-center", className)}>
        <Loader2Icon className="animate-spin stroke-1 stroke-muted-foreground" />
        <div className="text-xs absolute top-0 left-0 m-2 bg-background px-2 py-1 rounded-sm">Loading...</div>
      </div>
    );

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <img
        src={tileImgUrl}
        alt="Elevation tile"
        className="w-full h-full rounded-md object-fill"
        style={{ imageRendering: "pixelated" }}
      />
      <div className="text-xs absolute top-0 left-0 m-2 bg-background px-1 py-0.5 rounded-sm">{label}</div>
    </div>
  );
}

export default React.memo(Terrain2DCard);

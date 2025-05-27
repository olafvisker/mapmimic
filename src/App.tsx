import "maplibre-gl/dist/maplibre-gl.css";
import { useState } from "react";
import { type Tile } from "@mapbox/tilebelt";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import WorldMap from "./components/world-map";
import TerrainPanel from "./components/terrain-panel";
import { TreeDeciduousIcon } from "lucide-react";
import useMediaQuery from "./hooks/use-media-query";

function App() {
  const [selectedTile, setSelectedTile] = useState<Tile | null>(null);
  const isMobile = useMediaQuery("(max-width: 1024px)");
  const direction = isMobile ? "vertical" : "horizontal";

  return (
    <div className="h-screen w-full relative overflow-hidden">
      <div className="absolute top-0 left-0 m-8 z-50 bg-background pointer-events-none backdrop-blur-xl px-2 py-1 font-medium tracking-wide rounded-md flex items-center gap-1">
        <TreeDeciduousIcon className="size-5" /> MapMimic
      </div>

      <ResizablePanelGroup direction={direction} autoSaveId={"mapmagic-panel-size"}>
        <ResizablePanel className="m-4 rounded-md" minSize={20}>
          <WorldMap onTileSelect={setSelectedTile} />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel minSize={20}>
          <TerrainPanel tile={selectedTile} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

export default App;

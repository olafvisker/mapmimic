import "maplibre-gl/dist/maplibre-gl.css";
import { useState } from "react";
import { type Tile } from "@mapbox/tilebelt";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import WorldMap from "./components/world-map";
import TerrainPanel from "./components/terrain-panel";
import { TreeDeciduousIcon } from "lucide-react";

function App() {
  const [selectedTile, setSelectedTile] = useState<Tile | null>(null);

  return (
    <div className="h-screen w-full relative overflow-hidden">
      <div className="absolute top-0 left-0 m-8 z-50 bg-background pointer-events-none backdrop-blur-xl px-2 py-1 font-medium tracking-wide rounded-md flex items-center gap-1">
        <TreeDeciduousIcon className="size-5" /> MapMimic
      </div>

      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel className="m-4 rounded-md">
          <WorldMap onTileSelect={setSelectedTile} />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel>
          <TerrainPanel tile={selectedTile} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

export default App;

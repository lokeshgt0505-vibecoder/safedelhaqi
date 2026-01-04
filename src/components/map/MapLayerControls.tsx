import { Layers, MapPin, Circle, Hexagon, Thermometer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface LayerVisibility {
  stations: boolean;
  heatmap: boolean;
  voronoi: boolean;
  buffers: boolean;
}

interface MapLayerControlsProps {
  layers: LayerVisibility;
  onToggleLayer: (layer: keyof LayerVisibility) => void;
}

export function MapLayerControls({ layers, onToggleLayer }: MapLayerControlsProps) {
  return (
    <div className="absolute top-4 right-4 z-[1000]">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="sm" className="shadow-lg">
            <Layers className="h-4 w-4 mr-2" />
            Layers
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Map Layers</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuCheckboxItem
            checked={layers.stations}
            onCheckedChange={() => onToggleLayer('stations')}
          >
            <MapPin className="h-4 w-4 mr-2" />
            Station Markers
          </DropdownMenuCheckboxItem>
          
          <DropdownMenuCheckboxItem
            checked={layers.heatmap}
            onCheckedChange={() => onToggleLayer('heatmap')}
          >
            <Thermometer className="h-4 w-4 mr-2" />
            AQI Heatmap
          </DropdownMenuCheckboxItem>
          
          <DropdownMenuCheckboxItem
            checked={layers.voronoi}
            onCheckedChange={() => onToggleLayer('voronoi')}
          >
            <Hexagon className="h-4 w-4 mr-2" />
            Voronoi Zones
          </DropdownMenuCheckboxItem>
          
          <DropdownMenuCheckboxItem
            checked={layers.buffers}
            onCheckedChange={() => onToggleLayer('buffers')}
          >
            <Circle className="h-4 w-4 mr-2" />
            Influence Buffers
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

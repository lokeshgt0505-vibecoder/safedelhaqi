import { useState, useRef, useEffect } from 'react';
import { Search, X, MapPin, Navigation } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { StationData } from '@/types/aqi';
import { DELHI_STATIONS } from '@/lib/aqi-utils';
import { cn } from '@/lib/utils';

interface StationSearchProps {
  stations: StationData[];
  onSelect: (station: StationData) => void;
  onAddCustomLocation?: (coords: { lat: number; lng: number; name: string }) => void;
  placeholder?: string;
}

export function StationSearch({
  stations,
  onSelect,
  onAddCustomLocation,
  placeholder = 'Search stations, pincodes, or coordinates...',
}: StationSearchProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter stations based on query
  const filteredStations = stations.filter((station) =>
    station.name.toLowerCase().includes(query.toLowerCase())
  );

  // Check if query is coordinates (lat, lng)
  const coordsMatch = query.match(/^\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\s*$/);
  const isCoordinates = !!coordsMatch;

  // Check if query is a pincode (6 digits)
  const isPincode = /^\d{6}$/.test(query.trim());

  const showCustomLocation = (isCoordinates || isPincode) && onAddCustomLocation;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !inputRef.current?.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (station: StationData) => {
    onSelect(station);
    setQuery(station.name);
    setIsOpen(false);
  };

  const handleAddCustomLocation = () => {
    if (!onAddCustomLocation) return;

    if (isCoordinates && coordsMatch) {
      const lat = parseFloat(coordsMatch[1]);
      const lng = parseFloat(coordsMatch[2]);
      onAddCustomLocation({
        lat,
        lng,
        name: `Custom Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
      });
      setQuery('');
      setIsOpen(false);
    } else if (isPincode) {
      // For pincode, we'd need a geocoding service
      // For now, find the nearest known station
      const nearestStation = DELHI_STATIONS[0]; // Simplified
      onAddCustomLocation({
        lat: nearestStation.lat,
        lng: nearestStation.lng,
        name: `Pincode ${query.trim()} (Near ${nearestStation.name})`,
      });
      setQuery('');
      setIsOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    const totalItems = filteredStations.length + (showCustomLocation ? 1 : 0);

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((prev) => (prev < totalItems - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : totalItems - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < filteredStations.length) {
          handleSelect(filteredStations[activeIndex]);
        } else if (showCustomLocation) {
          handleAddCustomLocation();
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="pl-10 pr-10"
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {isOpen && (query || filteredStations.length > 0) && (
        <div
          ref={dropdownRef}
          className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-popover shadow-lg max-h-80 overflow-y-auto"
        >
          {filteredStations.length > 0 && (
            <div className="p-1">
              <p className="px-2 py-1 text-xs text-muted-foreground font-medium">
                Stations
              </p>
              {filteredStations.map((station, index) => (
                <button
                  key={station.id}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-2 text-left rounded-md transition-colors',
                    activeIndex === index
                      ? 'bg-accent text-accent-foreground'
                      : 'hover:bg-muted'
                  )}
                  onClick={() => handleSelect(station)}
                >
                  <MapPin className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{station.name}</p>
                    <p className="text-xs text-muted-foreground">
                      AQI: {station.aqi} · {station.zone.charAt(0).toUpperCase() + station.zone.slice(1)} Zone
                    </p>
                  </div>
                  <div
                    className={cn(
                      'w-3 h-3 rounded-full',
                      station.zone === 'blue' && 'bg-zone-blue',
                      station.zone === 'yellow' && 'bg-zone-yellow',
                      station.zone === 'red' && 'bg-zone-red'
                    )}
                  />
                </button>
              ))}
            </div>
          )}

          {showCustomLocation && (
            <div className="p-1 border-t border-border">
              <button
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2 text-left rounded-md transition-colors',
                  activeIndex === filteredStations.length
                    ? 'bg-accent text-accent-foreground'
                    : 'hover:bg-muted'
                )}
                onClick={handleAddCustomLocation}
              >
                <Navigation className="h-4 w-4 text-primary" />
                <div className="flex-1">
                  <p className="font-medium">
                    {isCoordinates
                      ? `Add location at ${coordsMatch![1]}, ${coordsMatch![2]}`
                      : `Find stations near pincode ${query.trim()}`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Custom location
                  </p>
                </div>
              </button>
            </div>
          )}

          {filteredStations.length === 0 && !showCustomLocation && query && (
            <div className="p-4 text-center text-muted-foreground">
              <p className="text-sm">No stations found</p>
              <p className="text-xs mt-1">
                Try entering coordinates (28.6, 77.2) or a pincode
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

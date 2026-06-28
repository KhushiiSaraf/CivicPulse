import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { Map as MapIcon, MapPin, Search, Loader2, Info, Navigation, Compass, ShieldAlert } from "lucide-react";
import { CivicIssue, SeverityLevel } from "../types";

interface CityMapProps {
  issues: CivicIssue[];
  onSelectIssue?: (id: string) => void;
  selectedIssueId?: string | null;
  onPlacePin?: (coords: { x: number; y: number; address: string; lat?: number; lng?: number }) => void;
  isInteractiveReporting?: boolean;
}

// Center of San Francisco, CA
const DEFAULT_CENTER: [number, number] = [37.7749, -122.4194];

export default function CityMap({
  issues,
  onSelectIssue,
  selectedIssueId,
  onPlacePin,
  isInteractiveReporting = false,
}: CityMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const tempMarkerRef = useRef<L.Marker | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [activeIssueDetail, setActiveIssueDetail] = useState<CivicIssue | null>(null);

  // Helper to project standard grid coordinates (mapX, mapY) to real-world SF coordinates if real ones aren't stored
  const getCoordinates = (issue: CivicIssue): [number, number] => {
    if (issue.lat !== undefined && issue.lng !== undefined) {
      return [issue.lat, issue.lng];
    }
    // Fallback deterministic projection around central San Francisco
    const x = issue.mapX !== undefined ? issue.mapX : 50;
    const y = issue.mapY !== undefined ? issue.mapY : 50;
    const projectedLat = DEFAULT_CENTER[0] + ((y - 50) * -0.0006);
    const projectedLng = DEFAULT_CENTER[1] + ((x - 50) * 0.0008);
    return [projectedLat, projectedLng];
  };

  // Create custom marker icons based on severity and selection status
  const createCustomIcon = (severity: SeverityLevel, isSelected: boolean) => {
    let color = "#3b82f6"; // Low (Blue)
    if (severity === "Medium") color = "#eab308"; // Medium (Yellow)
    else if (severity === "High") color = "#f97316"; // High (Orange)
    else if (severity === "Critical") color = "#dc2626"; // Critical (Red)

    const pulseClass = severity === "Critical" ? "animate-ping" : isSelected ? "animate-pulse" : "";
    const size = isSelected ? "w-7 h-7" : "w-5.5 h-5.5";
    const innerSize = isSelected ? "w-2.5 h-2.5" : "w-1.5 h-1.5";

    const html = `
      <div class="relative flex items-center justify-center">
        <div class="absolute w-8 h-8 rounded-full bg-[${color}] opacity-35 ${pulseClass}"></div>
        <div class="${size} rounded-full bg-[${color}] border-2 border-white shadow-md flex items-center justify-center text-white transition-all duration-300 transform ${isSelected ? 'scale-125 ring-2 ring-orange-500' : 'hover:scale-115'}">
          <div class="${innerSize} bg-white rounded-full"></div>
        </div>
      </div>
    `;

    return L.divIcon({
      html,
      className: "custom-leaflet-icon",
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });
  };

  // Initialize Map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Initialize map centered on SF
    const map = L.map(containerRef.current, {
      center: DEFAULT_CENTER,
      zoom: 13,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    // Elegant CartoDB Positron (Light Theme) Maps layer
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 20,
    }).addTo(map);

    // Layer group for marker management
    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;
    mapRef.current = map;

    // Handle map clicks to place new reported issue pin
    map.on("click", async (e: L.LeafletMouseEvent) => {
      if (!isInteractiveReporting || !onPlacePin) return;
      const { lat, lng } = e.latlng;

      // Update the temporary marker on-screen
      if (tempMarkerRef.current) {
        tempMarkerRef.current.setLatLng(e.latlng);
      } else {
        const tempIcon = L.divIcon({
          html: `
            <div class="relative flex flex-col items-center">
              <div class="bg-orange-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded shadow-sm mb-1 whitespace-nowrap animate-bounce">
                New Issue
              </div>
              <div class="w-6 h-6 rounded-full bg-orange-600 border-2 border-white shadow-lg flex items-center justify-center text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              </div>
            </div>
          `,
          className: "temp-marker-icon",
          iconSize: [80, 50],
          iconAnchor: [40, 50],
        });
        const marker = L.marker(e.latlng, { icon: tempIcon }).addTo(map);
        tempMarkerRef.current = marker;
      }

      setGeocoding(true);
      try {
        // Reverse-geocode coordinates using free OSM Nominatim API
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
          { headers: { "Accept-Language": "en" } }
        );
        const data = await res.json();
        
        // Build readable address from response components
        const addrParts = data.address;
        const street = addrParts.road || addrParts.suburb || addrParts.neighbourhood || "";
        const city = addrParts.city || addrParts.town || addrParts.village || "";
        const postcode = addrParts.postcode || "";
        
        const readableAddress = street 
          ? `${street}${city ? ', ' + city : ''}${postcode ? ' ' + postcode : ''}`
          : data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;

        onPlacePin({
          x: 50,
          y: 50,
          address: readableAddress,
          lat,
          lng,
        });
      } catch (error) {
        console.error("Geocoding error:", error);
        onPlacePin({
          x: 50,
          y: 50,
          address: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
          lat,
          lng,
        });
      } finally {
        setGeocoding(false);
      }
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      tempMarkerRef.current = null;
      markersLayerRef.current = null;
    };
  }, [isInteractiveReporting, onPlacePin]);

  // Sync Issues and selected state on the map
  useEffect(() => {
    const map = mapRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    // Clear active issue markers
    markersLayer.clearLayers();

    issues.forEach((issue) => {
      const coords = getCoordinates(issue);
      const isSelected = selectedIssueId === issue.id;

      const marker = L.marker(coords, {
        icon: createCustomIcon(issue.severity, isSelected),
      });

      // Bind simple hover tooltip
      marker.bindTooltip(
        `<div class="p-1.5 font-sans">
          <div class="font-bold text-xs text-slate-800">${issue.category.toUpperCase()}</div>
          <div class="text-[10px] text-slate-500">${issue.location}</div>
          <div class="text-[9px] font-semibold text-slate-400 mt-0.5">Severity: ${issue.severity}</div>
        </div>`,
        { direction: "top", offset: [0, -10], opacity: 0.95 }
      );

      // Handle marker click to update selection and expand feed
      marker.on("click", (e) => {
        L.DomEvent.stopPropagation(e);
        if (onSelectIssue) onSelectIssue(issue.id);
        setActiveIssueDetail(issue);
      });

      markersLayer.addLayer(marker);
    });

    // Auto-focus selected issue if available
    if (selectedIssueId) {
      const selectedIssue = issues.find((issue) => issue.id === selectedIssueId);
      if (selectedIssue) {
        const coords = getCoordinates(selectedIssue);
        map.setView(coords, 15, { animate: true, duration: 1 });
        setActiveIssueDetail(selectedIssue);

        // If a temporary report marker exists, clear it when browsing existing issues
        if (tempMarkerRef.current) {
          tempMarkerRef.current.remove();
          tempMarkerRef.current = null;
        }
      }
    } else {
      setActiveIssueDetail(null);
    }
  }, [issues, selectedIssueId]);

  // Handle Search Location
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || !mapRef.current) return;

    setIsSearching(true);
    setSearchError(null);

    try {
      const encodedQuery = encodeURIComponent(searchQuery + " San Francisco");
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodedQuery}&limit=1`,
        { headers: { "Accept-Language": "en" } }
      );
      const data = await res.json();

      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lon);

        // Pan map to search results
        mapRef.current.setView([latitude, longitude], 15, { animate: true, duration: 1.5 });

        // If reporting is interactive, place the report pin there
        if (isInteractiveReporting && onPlacePin) {
          if (tempMarkerRef.current) {
            tempMarkerRef.current.setLatLng([latitude, longitude]);
          } else {
            const tempIcon = L.divIcon({
              html: `
                <div class="relative flex flex-col items-center">
                  <div class="bg-orange-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded shadow-sm mb-1 whitespace-nowrap animate-bounce">
                    New Issue
                  </div>
                  <div class="w-6 h-6 rounded-full bg-orange-600 border-2 border-white shadow-lg flex items-center justify-center text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  </div>
                </div>
              `,
              className: "temp-marker-icon",
              iconSize: [80, 50],
              iconAnchor: [40, 50],
            });
            const marker = L.marker([latitude, longitude], { icon: tempIcon }).addTo(mapRef.current);
            tempMarkerRef.current = marker;
          }

          onPlacePin({
            x: 50,
            y: 50,
            address: display_name.split(",").slice(0, 3).join(", "),
            lat: latitude,
            lng: longitude,
          });
        }
      } else {
        setSearchError("No locations found in San Francisco for this address.");
      }
    } catch (error) {
      setSearchError("Search service is temporarily unavailable.");
      console.error(error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-orange-100 p-5 shadow-sm space-y-4">
      {/* Map Header with Real Interactive search */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-orange-50 pb-4">
        <div className="flex items-center space-x-2.5">
          <div className="w-8.5 h-8.5 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 shrink-0">
            <MapIcon className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-black text-gray-900 tracking-tight flex items-center gap-1.5">
              Live Real-World City Map
            </h3>
            <p className="text-[11px] text-gray-500 font-medium">
              {isInteractiveReporting
                ? "💡 Search an address, or double-click anywhere on map to instantly drop a pin!"
                : "Browse community issues dynamically across San Francisco."}
            </p>
          </div>
        </div>

        {/* Real-time Address Search Box */}
        <form onSubmit={handleSearch} className="relative w-full md:w-72 flex items-center">
          <input
            type="text"
            placeholder="Search SF (e.g. Hayes Valley)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8.5 pr-14 py-1.5 text-xs border border-orange-100 rounded-lg text-gray-700 bg-orange-50/20 focus:outline-none focus:ring-1.5 focus:ring-orange-400 focus:border-transparent focus:bg-white placeholder-gray-400 font-medium transition-all"
          />
          <div className="absolute left-3 text-gray-400">
            <Search className="w-3.5 h-3.5" />
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className="absolute right-1.5 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-300 text-white font-extrabold text-[10px] px-2.5 py-1 rounded-md transition-all shadow-sm shrink-0"
          >
            {isSearching ? <Loader2 className="w-3 h-3 animate-spin" /> : "Search"}
          </button>
        </form>
      </div>

      {searchError && (
        <div className="text-[10px] font-bold text-red-600 bg-red-50/50 border border-red-100 px-3 py-1.5 rounded-lg animate-fade-in flex items-center gap-1">
          <ShieldAlert className="w-3 h-3 text-red-500" />
          {searchError}
        </div>
      )}

      {/* Map Element */}
      <div className="relative w-full h-[320px] rounded-xl bg-slate-50 border border-slate-100 overflow-hidden shadow-inner flex flex-col md:flex-row">
        {/* Interactive map frame */}
        <div ref={containerRef} className="w-full h-full z-0 relative cursor-crosshair">
          {geocoding && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center z-20 space-x-2 animate-fade-in">
              <Loader2 className="w-5 h-5 text-orange-600 animate-spin" />
              <span className="text-xs font-bold text-orange-800">Reverse Geocoding Coordinates...</span>
            </div>
          )}
        </div>

        {/* Selected Issue Quick Detail panel floating inside map frame */}
        {activeIssueDetail && (
          <div className="absolute bottom-3 left-3 right-3 md:left-4 md:right-auto md:w-80 bg-slate-900/95 backdrop-blur-md text-white rounded-xl p-3.5 border border-slate-700/50 shadow-2xl z-10 animate-fade-in">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[8px] font-black uppercase tracking-wider bg-orange-500 text-white px-1.5 py-0.5 rounded">
                  {activeIssueDetail.category}
                </span>
                <h4 className="text-xs font-bold text-white mt-2 line-clamp-1">
                  {activeIssueDetail.summary}
                </h4>
              </div>
              <button
                onClick={() => setActiveIssueDetail(null)}
                className="text-gray-400 hover:text-white text-xs font-bold px-1.5 py-0.5 hover:bg-slate-800 rounded transition-all"
              >
                ✕
              </button>
            </div>

            <p className="text-[10px] text-gray-300 mt-2 line-clamp-2 leading-relaxed font-medium">
              {activeIssueDetail.description}
            </p>

            <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-800 text-[10px] text-gray-400 font-semibold">
              <div className="flex items-center space-x-1.5 max-w-[170px] truncate">
                <MapPin className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                <span className="truncate">{activeIssueDetail.location}</span>
              </div>
              <span className="text-[9px] font-extrabold text-orange-300 bg-orange-950/40 px-2 py-0.5 rounded">
                {activeIssueDetail.severity} Severity
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Map Legend */}
      <div className="bg-orange-50/20 rounded-xl p-3 border border-orange-100/50 flex flex-wrap items-center justify-between gap-3">
        <span className="text-[10px] font-black text-orange-900 uppercase tracking-widest flex items-center gap-1.5">
          <Info className="w-4 h-4 text-orange-600" />
          MAPPING LEGEND
        </span>
        <div className="flex flex-wrap items-center gap-3.5 text-[10px] font-bold text-gray-600">
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 border border-white shadow-sm ring-1 ring-blue-300"></span>
            <span>Low</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 border border-white shadow-sm ring-1 ring-yellow-300"></span>
            <span>Medium</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 border border-white shadow-sm ring-1 ring-orange-300"></span>
            <span>High</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 border border-white shadow-sm ring-1 ring-red-400"></span>
            <span>Critical</span>
          </span>
          <span className="w-px h-3 bg-gray-200"></span>
          <span className="text-[10px] text-orange-700 italic">
            *Click pin on the map to show issue detail or center the feed.
          </span>
        </div>
      </div>
    </div>
  );
}

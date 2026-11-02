'use client';

import { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import { filterLocalLocations, searchOnlineLocations } from '../lib/locationSearch';

// Indian Agroforestry & Farm presets for instant demo navigation
const PRESET_LOCATIONS = [
  { name: 'Nagpur, MH (Neem & Teak)', lat: 21.1458, lng: 79.0882, state: 'Maharashtra', district: 'Nagpur' },
  { name: 'Nashik, MH (Horticulture)', lat: 19.9975, lng: 73.7898, state: 'Maharashtra', district: 'Nashik' },
  { name: 'Wayanad, KL (Bamboo & Forest)', lat: 11.6854, lng: 76.1320, state: 'Kerala', district: 'Wayanad' },
  { name: 'Ludhiana, PB (Agro-farms)', lat: 30.9010, lng: 75.8573, state: 'Punjab', district: 'Ludhiana' },
  { name: 'Sundarbans, WB (Mangroves)', lat: 21.9497, lng: 88.9004, state: 'West Bengal', district: 'South 24 Parganas' },
  { name: 'Dehradun, UK (Forest Conservation)', lat: 30.3165, lng: 78.0322, state: 'Uttarakhand', district: 'Dehradun' }
];

export default function LandMap({
  initialLat = 21.1458,
  initialLng = 79.0882,
  landAreaAcres = 3.5,
  onLocationSelect,
  readOnly = false,
  showScanEffect = false
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const polygonRef = useRef(null);
  const LRef = useRef(null);

  const [currentCoords, setCurrentCoords] = useState({ lat: initialLat, lng: initialLng });
  const [mapType, setMapType] = useState('satellite'); // 'satellite' | 'streets'
  const [activeLayers, setActiveLayers] = useState({ satellite: null, streets: null });
  const [isLocating, setIsLocating] = useState(false);

  // Location Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Compute bounding box / polygon around pin based on acres
  const updateParcelBoundary = (L, map, lat, lng, acres) => {
    if (polygonRef.current) {
      map.removeLayer(polygonRef.current);
    }

    // 1 acre = ~4046.86 m2. Radius in meters: sqrt(area / pi)
    const areaM2 = (Number(acres) || 2) * 4046.86;
    const radiusMeters = Math.sqrt(areaM2 / Math.PI);

    // Approximate lat/lng delta (1 deg lat ~= 111,320m)
    const latDelta = radiusMeters / 111320;
    const lngDelta = radiusMeters / (111320 * Math.cos((lat * Math.PI) / 180));

    // Polygon coordinates for a realistic parcel boundary
    const polygonCoords = [
      [lat + latDelta * 0.95, lng - lngDelta * 0.9],
      [lat + latDelta * 1.05, lng + lngDelta * 0.85],
      [lat - latDelta * 0.85, lng + lngDelta * 1.1],
      [lat - latDelta * 1.0, lng - lngDelta * 0.75]
    ];

    polygonRef.current = L.polygon(polygonCoords, {
      color: '#4caf50',
      weight: 3,
      fillColor: '#81c784',
      fillOpacity: showScanEffect ? 0.5 : 0.35,
      dashArray: showScanEffect ? '6, 6' : null
    }).addTo(map);

    polygonRef.current.bindPopup(`
      <div style="font-family: sans-serif; font-size: 13px; line-height: 1.5;">
        <strong style="color: #2e7d32;">🌱 Verified Green Parcel</strong><br/>
        Area: <strong>${acres} Acres</strong> (~${Math.round(areaM2).toLocaleString()} m²)<br/>
        Lat: <strong>${lat.toFixed(5)}</strong>, Lng: <strong>${lng.toFixed(5)}</strong>
      </div>
    `);
  };

  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (typeof window === 'undefined' || !mapContainerRef.current) return;
      if (mapInstanceRef.current) return; // already initialized

      const L = await import('leaflet');
      LRef.current = L;

      // Create Map
      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: 14,
        zoomControl: true,
        scrollWheelZoom: !readOnly
      });
      mapInstanceRef.current = map;

      // Base Tile Layers
      const satelliteLayer = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: 'Tiles &copy; Esri, Maxar, Earthstar Geographics',
          maxZoom: 18
        }
      );

      const streetsLayer = L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19
        }
      );

      satelliteLayer.addTo(map);
      setActiveLayers({ satellite: satelliteLayer, streets: streetsLayer });

      // Custom Sprout Marker Icon
      const customPinIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `
          <div style="
            background: #2e7d32;
            border: 3px solid #ffffff;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            width: 36px;
            height: 36px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
          ">
            <span style="transform: rotate(45deg); font-size: 18px;">🌱</span>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -36]
      });

      // Place Marker
      const marker = L.marker([initialLat, initialLng], {
        icon: customPinIcon,
        draggable: !readOnly
      }).addTo(map);
      markerRef.current = marker;

      // Draw initial parcel boundary polygon
      updateParcelBoundary(L, map, initialLat, initialLng, landAreaAcres);

      const notifySelection = (lat, lng) => {
        const formatted = `${Math.abs(lat).toFixed(4)}° ${lat >= 0 ? 'N' : 'S'}, ${Math.abs(lng).toFixed(4)}° ${lng >= 0 ? 'E' : 'W'}`;
        setCurrentCoords({ lat, lng });
        if (onLocationSelect) {
          onLocationSelect({
            lat: Number(lat.toFixed(5)),
            lng: Number(lng.toFixed(5)),
            coordinatesString: formatted
          });
        }
      };

      if (!readOnly) {
        // Drag marker event
        marker.on('dragend', () => {
          const pos = marker.getLatLng();
          updateParcelBoundary(L, map, pos.lat, pos.lng, landAreaAcres);
          notifySelection(pos.lat, pos.lng);
        });

        // Click map to reposition marker
        map.on('click', (e) => {
          const { lat, lng } = e.latlng;
          marker.setLatLng([lat, lng]);
          updateParcelBoundary(L, map, lat, lng, landAreaAcres);
          notifySelection(lat, lng);
        });
      }
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update polygon when land area changes
  useEffect(() => {
    if (mapInstanceRef.current && LRef.current) {
      updateParcelBoundary(
        LRef.current,
        mapInstanceRef.current,
        currentCoords.lat,
        currentCoords.lng,
        landAreaAcres
      );
    }
  }, [landAreaAcres]);

  // Switch Tile Layer (Satellite vs OpenStreetMap)
  const toggleMapType = (type) => {
    if (!mapInstanceRef.current || !activeLayers.satellite) return;
    const map = mapInstanceRef.current;

    if (type === 'streets') {
      map.removeLayer(activeLayers.satellite);
      activeLayers.streets.addTo(map);
      setMapType('streets');
    } else {
      map.removeLayer(activeLayers.streets);
      activeLayers.satellite.addTo(map);
      setMapType('satellite');
    }
  };

  // Jump to location
  const jumpToLocation = (loc) => {
    if (!mapInstanceRef.current || !markerRef.current || !LRef.current) return;
    const map = mapInstanceRef.current;
    const marker = markerRef.current;
    const L = LRef.current;

    map.flyTo([loc.lat, loc.lng], 15, { duration: 1.2 });
    marker.setLatLng([loc.lat, loc.lng]);
    updateParcelBoundary(L, map, loc.lat, loc.lng, landAreaAcres);

    const formatted = `${Math.abs(loc.lat).toFixed(4)}° N, ${Math.abs(loc.lng).toFixed(4)}° E`;
    setCurrentCoords({ lat: loc.lat, lng: loc.lng });

    if (onLocationSelect) {
      onLocationSelect({
        lat: loc.lat,
        lng: loc.lng,
        coordinatesString: formatted,
        state: loc.state,
        district: loc.district
      });
    }
  };

  // Search Input Handler: Instant local feedback + opens dropdown
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);

    if (val.trim().length >= 2) {
      const localMatches = filterLocalLocations(val);
      setSearchResults(localMatches);
      setShowDropdown(true);
    } else {
      setSearchResults([]);
      setShowDropdown(false);
    }
  };

  // Perform full search (Local + Online Nominatim)
  const executeSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    const localMatches = filterLocalLocations(searchQuery);

    try {
      const onlineMatches = await searchOnlineLocations(searchQuery);
      // Deduplicate
      const combined = [...localMatches];
      for (const onl of onlineMatches) {
        if (!combined.some(c => Math.abs(c.lat - onl.lat) < 0.05 && Math.abs(c.lng - onl.lng) < 0.05)) {
          combined.push(onl);
        }
      }

      setSearchResults(combined);
      setShowDropdown(true);

      // Auto-jump to first result if found
      if (combined.length > 0) {
        jumpToLocation(combined[0]);
      }
    } catch {
      if (localMatches.length > 0) {
        jumpToLocation(localMatches[0]);
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      executeSearch();
    }
  };

  const selectSearchResult = (item) => {
    setSearchQuery(item.name);
    setShowDropdown(false);
    jumpToLocation(item);
  };

  // Browser Geolocation
  const handleUseCurrentLocation = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        const { latitude, longitude } = position.coords;
        jumpToLocation({
          name: 'Your Current Location',
          lat: latitude,
          lng: longitude,
          state: 'Local Region',
          district: 'GPS Fixed'
        });
      },
      () => {
        setIsLocating(false);
        // Fallback to Nagpur demo coordinates
        jumpToLocation(PRESET_LOCATIONS[0]);
      },
      { timeout: 5000 }
    );
  };

  const formattedDisplay = `${Math.abs(currentCoords.lat).toFixed(4)}° ${currentCoords.lat >= 0 ? 'N' : 'S'}, ${Math.abs(currentCoords.lng).toFixed(4)}° ${currentCoords.lng >= 0 ? 'E' : 'W'}`;

  return (
    <div className="land-map-wrapper">
      {/* 1. Location Search Bar (Visible in editable mode) */}
      {!readOnly && (
        <div className="map-search-bar-container">
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search your village, city, district, or pin code (e.g. Katol, Pune, Wayanad, 440001)..."
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
              className="map-search-input"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                  setShowDropdown(false);
                }}
                className="clear-search-btn"
                title="Clear search"
              >
                ✕
              </button>
            )}
            <button
              type="button"
              onClick={executeSearch}
              className="search-submit-btn"
              disabled={isSearching}
            >
              {isSearching ? 'Searching… ⏳' : 'Locate on Map'}
            </button>
          </div>

          {/* Search Results Dropdown */}
          {showDropdown && searchResults.length > 0 && (
            <div className="search-dropdown-menu">
              {searchResults.map((item, idx) => (
                <div
                  key={idx}
                  className="search-result-item"
                  onClick={() => selectSearchResult(item)}
                >
                  <div className="result-name">📍 {item.name}</div>
                  <div className="result-sub">
                    {item.district}, {item.state} • {item.lat.toFixed(4)}° N, {item.lng.toFixed(4)}° E
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. Top Map Controls */}
      {!readOnly && (
        <div className="map-toolbar">
          <div className="map-layer-selector">
            <button
              type="button"
              className={`layer-btn ${mapType === 'satellite' ? 'active' : ''}`}
              onClick={() => toggleMapType('satellite')}
            >
              🛰️ Satellite Imagery
            </button>
            <button
              type="button"
              className={`layer-btn ${mapType === 'streets' ? 'active' : ''}`}
              onClick={() => toggleMapType('streets')}
            >
              🗺️ Street Map
            </button>
          </div>

          <button
            type="button"
            className="action-button secondary gps-btn"
            onClick={handleUseCurrentLocation}
            disabled={isLocating}
          >
            {isLocating ? '📍 Pinpointing GPS…' : '📍 Use My GPS Location'}
          </button>
        </div>
      )}

      {/* 3. Interactive Leaflet Map Container */}
      <div className="map-container-frame">
        <div ref={mapContainerRef} className="map-view-box" />

        {/* Real-time scanning radar overlay for Step 3 */}
        {showScanEffect && (
          <div className="map-satellite-scan-overlay">
            <div className="satellite-scan-line"></div>
            <div className="satellite-tag">
              🛰️ SENTINEL-2 MULTI-SPECTRAL CANOPY SCAN ACTIVE
            </div>
          </div>
        )}
      </div>

      {/* 4. Preset Indian Agricultural Hubs */}
      {!readOnly && (
        <div className="presets-bar">
          <span className="presets-label">⚡ Quick Farming Hubs:</span>
          {PRESET_LOCATIONS.map((loc) => (
            <button
              key={loc.name}
              type="button"
              className="preset-chip"
              onClick={() => jumpToLocation(loc)}
            >
              {loc.name}
            </button>
          ))}
        </div>
      )}

      {/* 5. Coordinates readout and instruction pill */}
      <div className="coordinates-readout-card">
        <div className="coord-info">
          <span className="coord-icon">📍</span>
          <div>
            <div className="coord-val">
              <strong>{formattedDisplay}</strong>
            </div>
            <div className="coord-hint">
              {readOnly
                ? 'Target land parcel coordinates'
                : 'Search above, click anywhere on the satellite map, or drag the 🌱 pin to place your land parcel.'}
            </div>
          </div>
        </div>

        <div className="area-badge">
          Parcel: <strong>{landAreaAcres} Acres</strong>
        </div>
      </div>
    </div>
  );
}

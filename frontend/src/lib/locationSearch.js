/**
 * Indian Agricultural & Geographic Location Search Utility
 * Blends high-speed local Indian farming centroids with OpenStreetMap Nominatim geocoding.
 */

export const LOCAL_INDIAN_LOCATIONS = [
  // Maharashtra
  { name: 'Nagpur (Agroforestry & Orange Belts)', lat: 21.1458, lng: 79.0882, state: 'Maharashtra', district: 'Nagpur' },
  { name: 'Katol (Nagpur Rural Farm Belt)', lat: 21.2721, lng: 78.5869, state: 'Maharashtra', district: 'Nagpur' },
  { name: 'Nashik (Horticulture & Vineyards)', lat: 19.9975, lng: 73.7898, state: 'Maharashtra', district: 'Nashik' },
  { name: 'Pune (Western Ghats Agroforestry)', lat: 18.5204, lng: 73.8567, state: 'Maharashtra', district: 'Pune' },
  { name: 'Amravati (Cotton & Neem Plantations)', lat: 20.9374, lng: 77.7796, state: 'Maharashtra', district: 'Amravati' },
  { name: 'Kolhapur (Sugarcane & Agro-farms)', lat: 16.7050, lng: 74.2433, state: 'Maharashtra', district: 'Kolhapur' },

  // Kerala & South India
  { name: 'Wayanad (Coffee, Teak & Bamboo Forests)', lat: 11.6854, lng: 76.1320, state: 'Kerala', district: 'Wayanad' },
  { name: 'Idukki (Cardamom & Spice Plantations)', lat: 9.8500, lng: 76.9667, state: 'Kerala', district: 'Idukki' },
  { name: 'Coorg / Kodagu (Coffee & Shade Trees)', lat: 12.3375, lng: 75.8069, state: 'Karnataka', district: 'Kodagu' },
  { name: 'Chikkamagaluru (Agro-Forestry & Coffee)', lat: 13.3161, lng: 75.7720, state: 'Karnataka', district: 'Chikkamagaluru' },
  { name: 'Shivamogga (Arecanut & Teak Farms)', lat: 13.9299, lng: 75.5681, state: 'Karnataka', district: 'Shivamogga' },
  { name: 'Thanjavur (Cauvery Delta Rice & Coconut)', lat: 10.7870, lng: 79.1378, state: 'Tamil Nadu', district: 'Thanjavur' },

  // North & Central India
  { name: 'Ludhiana (Punjab Wheat & Agro-farms)', lat: 30.9010, lng: 75.8573, state: 'Punjab', district: 'Ludhiana' },
  { name: 'Hoshiarpur (Sub-Himalayan Agroforestry)', lat: 31.5273, lng: 75.9149, state: 'Punjab', district: 'Hoshiarpur' },
  { name: 'Karnal (Basmati Rice & Poplar Plantations)', lat: 29.6857, lng: 76.9905, state: 'Haryana', district: 'Karnal' },
  { name: 'Dehradun (Doon Valley Forest Conservation)', lat: 30.3165, lng: 78.0322, state: 'Uttarakhand', district: 'Dehradun' },
  { name: 'Pantnagar (Agricultural University Farm Belt)', lat: 29.0208, lng: 79.4930, state: 'Uttarakhand', district: 'Udham Singh Nagar' },
  { name: 'Varanasi (Gangetic Fertile Plains)', lat: 25.3176, lng: 82.9739, state: 'Uttar Pradesh', district: 'Varanasi' },
  { name: 'Indore (Malwa Plateau Soybean & Wheat)', lat: 22.7196, lng: 75.8577, state: 'Madhya Pradesh', district: 'Indore' },
  { name: 'Hoshangabad / Narmadapuram (Narmada Basin)', lat: 22.7519, lng: 77.7289, state: 'Madhya Pradesh', district: 'Narmadapuram' },

  // East & West India
  { name: 'Sundarbans (Coastal Mangrove Biosphere)', lat: 21.9497, lng: 88.9004, state: 'West Bengal', district: 'South 24 Parganas' },
  { name: 'Darjeeling (Tea & Montane Ecosystems)', lat: 27.0410, lng: 88.2663, state: 'West Bengal', district: 'Darjeeling' },
  { name: 'Anand (Amul Dairy & Fodder Farmlands)', lat: 22.5645, lng: 72.9289, state: 'Gujarat', district: 'Anand' },
  { name: 'Gir Somnath (Mango Orchards & Forest)', lat: 20.9015, lng: 70.4374, state: 'Gujarat', district: 'Gir Somnath' },
  { name: 'Kota (Chambal River Basin Agro-belt)', lat: 25.2138, lng: 75.8648, state: 'Rajasthan', district: 'Kota' },
  { name: 'Jorhat (Assam Tea & Bamboo Plantations)', lat: 26.7509, lng: 94.2037, state: 'Assam', district: 'Jorhat' }
];

export function filterLocalLocations(query) {
  if (!query || typeof query !== 'string' || query.trim().length < 2) {
    return [];
  }
  const clean = query.trim().toLowerCase();
  return LOCAL_INDIAN_LOCATIONS.filter(loc => 
    loc.name.toLowerCase().includes(clean) ||
    loc.state.toLowerCase().includes(clean) ||
    loc.district.toLowerCase().includes(clean)
  );
}

export function parseNominatimAddress(item) {
  if (!item) return null;
  const lat = parseFloat(item.lat);
  const lng = parseFloat(item.lon);
  const addr = item.address || {};

  const state = addr.state || addr.region || 'India';
  const rawDistrict = addr.city || addr.town || addr.village || addr.state_district || addr.county || 'Local District';
  const district = rawDistrict.replace(/\s+district$/i, '').trim();

  return {
    name: item.display_name.split(',').slice(0, 3).join(', '),
    fullName: item.display_name,
    lat,
    lng,
    state,
    district
  };
}

export async function searchOnlineLocations(query) {
  if (!query || query.trim().length < 2) return [];

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=6&addressdetails=1&countrycodes=in`;
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      }
    });

    if (res.ok) {
      const data = await res.json();
      return data.map(parseNominatimAddress).filter(Boolean);
    }
  } catch {
    // If online search has network/rate issues, local fallback handles it
  }

  return [];
}

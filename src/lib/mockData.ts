// Mock property data for Squamish real estate website
// Design Philosophy: Pacific Northwest Naturalism - Deep forest greens, slate grays, misty blues

export interface Listing {
  pid: string;
  mls_number: string | null;
  civic_address: string | null;
  asking_price: number | null;
  market_status: string | null;
  listing_date: string | null;
  dwell_type: string | null;
  photos: string[] | null;
  total_floor_area: number | null;
  lot_size: number | null;
  year_built: number | null;
  bedrooms: number | null;
  full_baths: number | null;
  half_baths: number | null;
  neighbourhood: string | null;
  postal_code: string | null;
  listing_office: string | null;
  property_category: string;
  zone_desc: string | null;
  legal_detail: string | null;
}

export const mockListings: Listing[] = [
  {
    pid: "028-123-456",
    mls_number: "R2987654",
    civic_address: "123 Stawamus Chief Road",
    asking_price: 1895000,
    market_status: "For Sale",
    listing_date: "2026-05-01",
    dwell_type: "House",
    photos: [
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&auto=format&fit=crop",
    ],
    total_floor_area: 3200,
    lot_size: 8500,
    year_built: 2019,
    bedrooms: 4,
    full_baths: 3,
    half_baths: 1,
    neighbourhood: "Garibaldi Highlands",
    postal_code: "V8B 0G1",
    listing_office: "Royal LePage Squamish",
    property_category: "Detached",
    zone_desc: "Bare Land Strata",
    legal_detail:
      "Strata Plan BCS1234, Lot 7, District Lot 123, Group 1, New Westminster Land District",
  },

  {
    pid: "029-654-321",
    mls_number: "R2988888",
    civic_address: "456 Howe Sound Drive",
    asking_price: 3250000,
    market_status: "For Sale",
    listing_date: "2026-05-04",
    dwell_type: "House",
    photos: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop",
    ],
    total_floor_area: 4500,
    lot_size: 12000,
    year_built: 2021,
    bedrooms: 5,
    full_baths: 4,
    half_baths: 1,
    neighbourhood: "Britannia Beach",
    postal_code: "V8B 1J2",
    listing_office: "Macdonald Realty",
    property_category: "Detached",
    zone_desc: "Bare Land Strata",
    legal_detail:
      "Strata Plan BCS5678, Lot 12, District Lot 456, Group 1, New Westminster Land District",
  },

  {
    pid: "027-777-999",
    mls_number: "R2976543",
    civic_address: "789 Cleveland Avenue",
    asking_price: 625000,
    market_status: "For Sale",
    listing_date: "2026-04-28",
    dwell_type: "Condo",
    photos: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&auto=format&fit=crop",
    ],
    total_floor_area: 1100,
    lot_size: null,
    year_built: 2016,
    bedrooms: 2,
    full_baths: 2,
    half_baths: 0,
    neighbourhood: "Downtown Squamish",
    postal_code: "V8B 0A1",
    listing_office: "RE/MAX Sea to Sky",
    property_category: "Strata",
    zone_desc: "Bare Land Strata",
    legal_detail:
      "Strata Plan BCS4321, Unit 5, District Lot 789, Group 1, New Westminster Land District",
  },

  {
    pid: "026-456-111",
    mls_number: "R2965432",
    civic_address: "567 Valleycliffe Road",
    asking_price: 875000,
    market_status: "Pending",
    listing_date: "2026-04-20",
    dwell_type: "Townhouse",
    photos: [
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&auto=format&fit=crop",
    ],
    total_floor_area: 1850,
    lot_size: null,
    year_built: 2018,
    bedrooms: 3,
    full_baths: 2,
    half_baths: 1,
    neighbourhood: "Valleycliffe",
    postal_code: "V8B 0W9",
    listing_office: "Stilhavn Real Estate",
    property_category: "Strata",
    zone_desc: "Bare Land Strata",
    legal_detail:
      "Strata Plan BCS8765, Unit 3, District Lot 321, Group 1, New Westminster Land District",
  },

  {
    pid: "025-999-222",
    mls_number: "R2954321",
    civic_address: "890 Garibaldi Way",
    asking_price: 2450000,
    market_status: "Sold",
    listing_date: "2026-03-30",
    dwell_type: "House",
    photos: [
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1200&auto=format&fit=crop",
    ],
    total_floor_area: 4200,
    lot_size: 9800,
    year_built: 2020,
    bedrooms: 5,
    full_baths: 4,
    half_baths: 1,
    neighbourhood: "Garibaldi Estates",
    postal_code: "V8B 0R2",
    listing_office: "Engel & Völkers Whistler",
    property_category: "Detached",
    zone_desc: "Bare Land Strata",
    legal_detail:
      "Strata Plan BCS3456, Lot 15, District Lot 654, Group 1, New Westminster Land District",
  },
];

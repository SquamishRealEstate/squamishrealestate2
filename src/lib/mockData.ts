// Mock property data for Squamish real estate website
// Design Philosophy: Pacific Northwest Naturalism - Deep forest greens, slate grays, misty blues

export interface Listing {
  id: string;
  title: string;
  price: number;
  address: string;
  neighborhood: string;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  type: "house" | "condo" | "townhouse" | "land";
  status: "for-sale" | "sold" | "pending";
  image: string;
  lat: number;
  lng: number;
  description: string;
  features: string[];
}

export const mockListings: Listing[] = [
  {
    id: "1",
    title: "Modern Mountain Retreat",
    price: 1895000,
    address: "123 Stawamus Chief Road",
    neighborhood: "Garibaldi Highlands",
    bedrooms: 4,
    bathrooms: 3,
    sqft: 3200,
    type: "house",
    status: "for-sale",
    image:
      "https://private-us-east-1.manuscdn.com/sessionFile/s28JNvt7FNbqBDcvkeiXw5/sandbox/5xyNfUtj2D8ALW69YKw8jb-img-2_1770580481000_na1fn_bHV4dXJ5LW1vdW50YWluLWhvbWU.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvczI4Sk52dDdGTmJxQkRjdmtlaVh3NS9zYW5kYm94LzV4eU5mVXRqMkQ4QUxXNjlZS3c4amItaW1nLTJfMTc3MDU4MDQ4MTAwMF9uYTFmbl9iSFY0ZFhKNUxXMXZkVzUwWVdsdUxXaHZiV1VucG5nP3gtb3NzLXByb2Nlc3M9aW1hZ2UvcmVzaXplLHdfMTkyMCxoXzE5MjAvZm9ybWF0LHdlYnAvcXVhbGl0eSxxXzgwIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzk4NzYxNjAwfX19XX0_&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=qf7kBpM6ZRDBp9u9K~tLl1g15mTdewqYMPIclSol9PeWAgCm4c-8WDlmjYXiO9xwMdi1Hd4kKy8oQWEuKhr6WYa4B7RUVibP8y66Br2rb0SkkDvLqlF0wmPW37rEqSPHH-67WfgFXeQCeJWiTe9QIj-In4WxCEh~CjJyyZmIIedd240CdUtzaySQUszfgysjgIDa9R2QWNowuxNZm~9n0ZJTso2ZKeMcUIoG0vZSBMzVI8cJNFl43rtEqaZoMvXr-NWZHKME09GLk1e5MiwBKsB~KYl177-qisrh~hRCbm3vlZCv5yqeMKwEkyXu3aKcKP~vI87PvlxGilJ0keJ6IQ__",
    lat: 49.7016,
    lng: -123.1558,
    description:
      "Stunning contemporary home nestled in the forest with panoramic mountain views. Floor-to-ceiling windows, natural wood finishes, and stone accents throughout.",
    features: [
      "Mountain Views",
      "Forest Setting",
      "Modern Design",
      "Natural Materials",
      "Large Windows",
    ],
  },
  {
    id: "2",
    title: "Waterfront Luxury Estate",
    price: 3250000,
    address: "456 Howe Sound Drive",
    neighborhood: "Britannia Beach",
    bedrooms: 5,
    bathrooms: 4,
    sqft: 4500,
    type: "house",
    status: "for-sale",
    image:
      "https://private-us-east-1.manuscdn.com/sessionFile/s28JNvt7FNbqBDcvkeiXw5/sandbox/5xyNfUtj2D8ALW69YKw8jb-img-3_1770580501000_na1fn_d2F0ZXJmcm9udC1wcm9wZXJ0eQ.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvczI4Sk52dDdGTmJxQkRjdmtlaVh3NS9zYW5kYm94LzV4eU5mVXRqMkQ4QUxXNjlZS3c4amItaW1nLTNfMTc3MDU4MDUwMTAwMF9uYTFmbl9kMkYwWlhKbWNtOXVkQzF3Y201d1pYSjBlUS5wbmc~eC1vc3MtcHJvY2Vzcz1pbWFnZS9yZXNpemUsd18xOTIwLGhfMTkyMC9mb3JtYXQsd2VicC9xdWFsaXR5LHFfODAiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3OTg3NjE2MDB9fX1dfQ__&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=X2SqpAdx7EbDKtH9fs2wdxA6u-9ACRa~txNYkOLiQ5V9aPf2u3akboKh958jE81JyIJTExQCWREmbhL9L-LRBVrWdOhunAPJg3TDGoAuwRLLHjc6WfW8jkR5wwgL6gVO0c7YioEyRnmaKA10IguiWoah2uzR4F0cdd7h9KGGQ16dq64oI~x-5rdh93E76USk0AecjKCsqYytc2tuieNB~CqByh~xSv41SRqvAxgPXpGJ2mQSgeQq71~OJUxC0yFmAR5WQP8dDSiQ-9jiLGnLl3XSuBcqnv5ADMO8nJJPKwnRBAZ3SOUCTVX3BO2icR4XerK89IW~NTKEINX0oYVB5g__",
    lat: 49.6505,
    lng: -123.205,
    description:
      "Exceptional waterfront property on Howe Sound with private dock and breathtaking mountain views. Expansive deck, native landscaping, and luxurious finishes.",
    features: [
      "Waterfront",
      "Private Dock",
      "Mountain Views",
      "Expansive Deck",
      "Luxury Finishes",
    ],
  },
  {
    id: "3",
    title: "Downtown Squamish Condo",
    price: 625000,
    address: "789 Cleveland Avenue",
    neighborhood: "Downtown Squamish",
    bedrooms: 2,
    bathrooms: 2,
    sqft: 1100,
    type: "condo",
    status: "for-sale",
    image:
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop",
    lat: 49.7016,
    lng: -123.1558,
    description:
      "Modern condo in the heart of downtown Squamish. Walk to shops, restaurants, and outdoor recreation. Mountain views from the balcony.",
    features: [
      "Downtown Location",
      "Mountain Views",
      "Modern Finishes",
      "Walkable",
      "Balcony",
    ],
  },
  {
    id: "4",
    title: "Brackendale Family Home",
    price: 1150000,
    address: "234 Eagle Run Drive",
    neighborhood: "Brackendale",
    bedrooms: 4,
    bathrooms: 3,
    sqft: 2800,
    type: "house",
    status: "for-sale",
    image:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop",
    lat: 49.75,
    lng: -123.1833,
    description:
      "Spacious family home in peaceful Brackendale. Large yard, updated kitchen, and close to schools. Perfect for families seeking mountain lifestyle.",
    features: [
      "Family Friendly",
      "Large Yard",
      "Updated Kitchen",
      "Near Schools",
      "Quiet Neighborhood",
    ],
  },
  {
    id: "5",
    title: "Valleycliffe Townhouse",
    price: 875000,
    address: "567 Valleycliffe Road",
    neighborhood: "Valleycliffe",
    bedrooms: 3,
    bathrooms: 2.5,
    sqft: 1850,
    type: "townhouse",
    status: "for-sale",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop",
    lat: 49.6833,
    lng: -123.1667,
    description:
      "Contemporary townhouse with open-concept living and mountain views. Close to trails and climbing areas. Low-maintenance lifestyle.",
    features: [
      "Townhouse",
      "Open Concept",
      "Mountain Views",
      "Near Trails",
      "Low Maintenance",
    ],
  },
  {
    id: "6",
    title: "Garibaldi Estates Luxury Home",
    price: 2450000,
    address: "890 Garibaldi Way",
    neighborhood: "Garibaldi Estates",
    bedrooms: 5,
    bathrooms: 4,
    sqft: 4200,
    type: "house",
    status: "pending",
    image:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&auto=format&fit=crop",
    lat: 49.7167,
    lng: -123.1417,
    description:
      "Prestigious Garibaldi Estates home with chef's kitchen, home theater, and wine cellar. Impeccable finishes and stunning mountain vistas.",
    features: [
      "Luxury",
      "Chef's Kitchen",
      "Home Theater",
      "Wine Cellar",
      "Mountain Vistas",
    ],
  },
  {
    id: "7",
    title: "Brennan Park Area Starter",
    price: 785000,
    address: "345 Brennan Park Drive",
    neighborhood: "Brennan Park",
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1600,
    type: "house",
    status: "for-sale",
    image:
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&auto=format&fit=crop",
    lat: 49.6917,
    lng: -123.1583,
    description:
      "Perfect starter home near Brennan Park. Cozy layout, fenced yard, and close to recreation facilities. Great value in desirable location.",
    features: [
      "Starter Home",
      "Fenced Yard",
      "Near Recreation",
      "Cozy Layout",
      "Great Value",
    ],
  },
  {
    id: "8",
    title: "Dentville Character Home",
    price: 950000,
    address: "678 Dentville Road",
    neighborhood: "Dentville",
    bedrooms: 3,
    bathrooms: 2,
    sqft: 2100,
    type: "house",
    status: "sold",
    image:
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&auto=format&fit=crop",
    lat: 49.6833,
    lng: -123.15,
    description:
      "Charming character home with original wood details and modern updates. Large lot with mature trees and garden space.",
    features: [
      "Character Home",
      "Large Lot",
      "Mature Trees",
      "Garden Space",
      "Updated",
    ],
  },
];

export const neighborhoods = [
  "All Neighborhoods",
  "Garibaldi Highlands",
  "Britannia Beach",
  "Downtown Squamish",
  "Brackendale",
  "Valleycliffe",
  "Garibaldi Estates",
  "Brennan Park",
  "Dentville",
];

export const listingTypes = [
  "All Types",
  "House",
  "Condo",
  "Townhouse",
  "Land",
];

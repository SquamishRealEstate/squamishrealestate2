// import { useState, useEffect } from "react";
// import { supabase } from "@/config/supabaseClient";
// import Navbar from "../Navbar";
// import { Button } from "@/components/ui/button";
// import { AuthGuard } from "../Auth/authGuard";
// import Link from "next/link";
// import { formatString } from "@/lib/utils";
// import { ChevronDown, ChevronUp, Lock } from "lucide-react";

// type Listing = {
//   pid: string;
//   mls_number: string | null;
//   civic_address: string | null;
//   asking_price: number | null;
//   market_status: string | null;
//   listing_date: string | null;
//   dwell_type: string | null;
//   photos: string[] | null;
//   total_floor_area: number | null;
//   lot_size: number | null;
//   year_built: number | null;
//   bedrooms: number | null;
//   full_baths: number | null;
//   half_baths: number | null;
//   neighbourhood: string | null;
//   postal_code: string | null;
//   listing_office: string | null;
//   property_category: string;
// };

// function AllListingsPage({ user }: { user: any }) {
//   const [listings, setListings] = useState<Listing[]>([]);
//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(0);
//   const [loading, setLoading] = useState(true);
//   const [showAdvanced, setShowAdvanced] = useState(false);

//   // --- FILTER STATES (What the user sees in the inputs) ---
//   const [searchQuery, setSearchQuery] = useState("");
//   const [category, setCategory] = useState<string[]>([]);
//   const [status, setStatus] = useState<string[]>(user ? [] : ["Active"]);
//   const [bedrooms, setBedrooms] = useState("");
//   const [bathrooms, setBathrooms] = useState("");
//   const [minPrice, setMinPrice] = useState("");
//   const [maxPrice, setMaxPrice] = useState("");
//   const [minLot, setMinLot] = useState("");
//   const [maxLot, setMaxLot] = useState("");
//   const [minArea, setMinArea] = useState("");
//   const [maxArea, setMaxArea] = useState("");
//   const [minYear, setMinYear] = useState("");
//   const [maxYear, setMaxYear] = useState("");

//   // --- SUBMITTED FILTER STATES (What actually triggers the API fetch) ---
//   const [appliedFilters, setAppliedFilters] = useState<any>({});

//   const ITEMS_PER_PAGE = 16;

//   // Run the fetch only when the page changes OR the user explicitly clicks "Search"
//   useEffect(() => {
//     fetchListings();
//   }, [page, appliedFilters]);

//   const handleSearchSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     setPage(1); // Reset back to page 1 for a brand new search
//     setAppliedFilters({
//       searchQuery,
//       category,
//       status,
//       bedrooms,
//       bathrooms,
//       minPrice,
//       maxPrice,
//       minLot,
//       maxLot,
//       minArea,
//       maxArea,
//       minYear,
//       maxYear,
//     });
//   };

//   const handleClearFilters = () => {
//     setSearchQuery("");
//     setCategory([]);
//     setStatus(user ? [] : ["Active"]);
//     setBedrooms("");
//     setBathrooms("");
//     setMinPrice("");
//     setMaxPrice("");
//     setMinLot("");
//     setMaxLot("");
//     setMinArea("");
//     setMaxArea("");
//     setMinYear("");
//     setMaxYear("");
//     setPage(1);
//     setAppliedFilters({});
//   };

//   async function fetchListings() {
//     setLoading(true);
//     const from = (page - 1) * ITEMS_PER_PAGE;
//     const to = from + ITEMS_PER_PAGE - 1;

//     let query = supabase.from("all_listings").select("*", { count: "exact" });

//     // --- ENFORCE SECURITY BORDERS FOR UNLOGGED USERS ---
//     if (!user) {
//       // Security override: Force public users to ONLY see Active properties
//       query = query.in("market_status", ["Active"]);
//     } else {
//       // Logged-in users: Respect whatever array of statuses they selected
//       if (appliedFilters.status && appliedFilters.status.length > 0) {
//         query = query.in("market_status", appliedFilters.status);
//       }
//     }

//     // Apply the filters stored in appliedFilters state
//     if (appliedFilters.searchQuery) {
//       query = query.or(
//         `civic_address.ilike.%${appliedFilters.searchQuery}%,mls_number.ilike.%${appliedFilters.searchQuery}%,neighbourhood.ilike.%${appliedFilters.searchQuery}%`,
//       );
//     }
//     if (appliedFilters.category && appliedFilters.category.length > 0) {
//       query = query.in("property_category", appliedFilters.category);
//     }
//     // if (appliedFilters.status)
//     //   query = query.eq("market_status", appliedFilters.status);
//     if (appliedFilters.bedrooms)
//       query = query.gte("bedrooms", parseInt(appliedFilters.bedrooms));
//     if (appliedFilters.bathrooms)
//       query = query.gte("full_baths", parseInt(appliedFilters.bathrooms));
//     if (appliedFilters.minPrice)
//       query = query.gte("asking_price", parseFloat(appliedFilters.minPrice));
//     if (appliedFilters.maxPrice)
//       query = query.lte("asking_price", parseFloat(appliedFilters.maxPrice));
//     if (appliedFilters.minLot)
//       query = query.gte("lot_size", parseInt(appliedFilters.minLot));
//     if (appliedFilters.maxLot)
//       query = query.lte("lot_size", parseInt(appliedFilters.maxLot));
//     if (appliedFilters.minArea)
//       query = query.gte("total_floor_area", parseInt(appliedFilters.minArea));
//     if (appliedFilters.maxArea)
//       query = query.lte("total_floor_area", parseInt(appliedFilters.maxArea));
//     if (appliedFilters.minYear)
//       query = query.gte("year_built", parseInt(appliedFilters.minYear));
//     if (appliedFilters.maxYear)
//       query = query.lte("year_built", parseInt(appliedFilters.maxYear));

//     const { data, count, error } = await query
//       .order("listing_date", { ascending: false })
//       .range(from, to);

//     if (error) {
//       console.error("Error fetching listings:", error);
//     } else {
//       setListings(data || []);
//       setTotalPages(Math.ceil((count ?? 0) / ITEMS_PER_PAGE));
//     }

//     setLoading(false);
//     window.scrollTo({ top: 0, behavior: "smooth" });
//   }

//   return (
//     <div className="bg-background min-h-screen">
//       <Navbar />
//       <div className="pt-32 pb-16 px-6 bg-gray-50 min-h-screen font-sans">
//         <div className="flex justify-between items-center mb-8">
//           <div>
//             <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
//               Properties
//             </h1>
//           </div>
//         </div>

//         {/* --- PREMIUM FILTER PANEL --- */}
//         <form
//           onSubmit={handleSearchSubmit}
//           className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 space-y-6"
//         >
//           {/* ROW 1: PRIMARY TEXT SEARCH */}
//           <div className="flex flex-col">
//             <label className="text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider">
//               Location / Keywords
//             </label>
//             <div className="relative">
//               <input
//                 type="text"
//                 placeholder="Search address, MLS® number, or neighborhood..."
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-gray-50/50 transition-all placeholder:text-gray-400"
//               />
//               <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">
//                 🔍
//               </span>
//             </div>
//           </div>

//           {/* ROW 2: CONTEMPORARY BADGE SELECTIONS (GRID TO FLEX/WRAP) */}
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
//             {/* Property Types */}
//             <div className="flex flex-col space-y-2.5">
//               <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
//                 Property Types
//               </label>
//               <div className="flex flex-wrap gap-2">
//                 {[
//                   { id: "detached", label: "Detached" },
//                   { id: "strata", label: "Strata (Condo)" },
//                   { id: "multifamily", label: "Multi-Family" },
//                   { id: "land", label: "Land" },
//                 ].map((type) => {
//                   const isSelected = category.includes(type.id);
//                   return (
//                     <button
//                       key={type.id}
//                       type="button"
//                       onClick={() => {
//                         if (isSelected) {
//                           setCategory(category.filter((c) => c !== type.id));
//                         } else {
//                           setCategory([...category, type.id]);
//                         }
//                       }}
//                       className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all duration-150 ${
//                         isSelected
//                           ? "bg-primary border-primary text-white shadow-xs"
//                           : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300"
//                       }`}
//                     >
//                       {type.label}
//                     </button>
//                   );
//                 })}
//               </div>
//             </div>

//             {/* Market Status */}
//             <div className="flex flex-col space-y-2.5">
//               <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
//                 Market Status
//               </label>
//               <div className="flex flex-wrap gap-2">
//                 {[
//                   { id: "Active", label: "Active" },
//                   { id: "Pending", label: "Pending" },
//                   { id: "Expired", label: "Expired" },
//                   { id: "Terminated", label: "Terminated" },
//                   { id: "Closed", label: "Closed" },
//                   { id: "Cancel Protected", label: "Cancel Protected" },
//                 ].map((item) => {
//                   const isSelected = user
//                     ? status.includes(item.id)
//                     : item.id === "Active";

//                   return (
//                     <button
//                       key={item.id}
//                       type="button"
//                       disabled={!user}
//                       onClick={() => {
//                         if (isSelected) {
//                           setStatus(status.filter((s) => s !== item.id));
//                         } else {
//                           setStatus([...status, item.id]);
//                         }
//                       }}
//                       className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all duration-150 flex items-center gap-1.5 ${
//                         isSelected
//                           ? "bg-primary border-primary text-white shadow-xs"
//                           : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300"
//                       } ${
//                         !user
//                           ? isSelected
//                             ? "opacity-100 cursor-not-allowed"
//                             : "opacity-60 bg-gray-50 border-gray-100 text-gray-400 cursor-not-allowed"
//                           : ""
//                       }`}
//                     >
//                       <span>{item.label}</span>
//                       {!user && item.id !== "Active" && (
//                         <Lock className="size-3.5 opacity-80" />
//                       )}
//                     </button>
//                   );
//                 })}
//               </div>
//             </div>
//           </div>

//           <hr className="border-gray-100 my-2" />

//           {/* ROW 3: BEDS, BATHS, PRICING PARAMETERS */}
//           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
//             {/* Price Fields combined into a clean multi-input layout container */}
//             <div className="sm:col-span-2 flex flex-col">
//               <label className="text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider">
//                 Price Range
//               </label>
//               <div className="flex items-center space-x-2">
//                 <input
//                   type="number"
//                   placeholder="$ Min"
//                   value={minPrice}
//                   onChange={(e) => setMinPrice(e.target.value)}
//                   className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
//                 />
//                 <span className="text-gray-300 text-xs font-bold">to</span>
//                 <input
//                   type="number"
//                   placeholder="$ Max"
//                   value={maxPrice}
//                   onChange={(e) => setMaxPrice(e.target.value)}
//                   className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
//                 />
//               </div>
//             </div>

//             <div className="flex flex-col">
//               <label className="text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider">
//                 Beds
//               </label>
//               <select
//                 value={bedrooms}
//                 onChange={(e) => setBedrooms(e.target.value)}
//                 className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-700"
//               >
//                 <option value="">Any Beds</option>
//                 <option value="1">1+ Beds</option>
//                 <option value="2">2+ Beds</option>
//                 <option value="3">3+ Beds</option>
//                 <option value="4">4+ Beds</option>
//               </select>
//             </div>

//             <div className="flex flex-col">
//               <label className="text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider">
//                 Baths
//               </label>
//               <select
//                 value={bathrooms}
//                 onChange={(e) => setBathrooms(e.target.value)}
//                 className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-700"
//               >
//                 <option value="">Any Baths</option>
//                 <option value="1">1+ Baths</option>
//                 <option value="2">2+ Baths</option>
//                 <option value="3">3+ Baths</option>
//               </select>
//             </div>
//           </div>

//           {/* TOGGLE ADVANCED BUTTON CENTERED LINE CONTAINER */}
//           <div className="flex items-center justify-center pt-2">
//             <Button
//               type="button"
//               variant="ghost"
//               size="sm"
//               onClick={() => setShowAdvanced(!showAdvanced)}
//               className="text-xs font-bold text-gray-500 hover:bg-gray-100 hover:text-gray-900 rounded-xl"
//             >
//               {showAdvanced ? (
//                 <>
//                   Hide Advanced Filters
//                   <ChevronUp className="transition-transform duration-200" />
//                 </>
//               ) : (
//                 <>
//                   Show Advanced Filters
//                   <ChevronDown className="transition-transform duration-200" />
//                 </>
//               )}
//             </Button>
//           </div>

//           {/* --- ADVANCED COLLAPSIBLE DRAWER --- */}
//           {showAdvanced && (
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-gray-100 transition-all">
//               <div className="flex flex-col">
//                 <label className="text-xs font-medium text-gray-500 mb-2">
//                   Floor Area (sqft)
//                 </label>
//                 <div className="flex items-center space-x-2">
//                   <input
//                     type="number"
//                     placeholder="Min"
//                     value={minArea}
//                     onChange={(e) => setMinArea(e.target.value)}
//                     className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
//                   />
//                   <input
//                     type="number"
//                     placeholder="Max"
//                     value={maxArea}
//                     onChange={(e) => setMaxArea(e.target.value)}
//                     className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
//                   />
//                 </div>
//               </div>

//               <div className="flex flex-col">
//                 <label className="text-xs font-medium text-gray-500 mb-2">
//                   Lot Size (sqft)
//                 </label>
//                 <div className="flex items-center space-x-2">
//                   <input
//                     type="number"
//                     placeholder="Min"
//                     value={minLot}
//                     onChange={(e) => setMinLot(e.target.value)}
//                     className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
//                   />
//                   <input
//                     type="number"
//                     placeholder="Max"
//                     value={maxLot}
//                     onChange={(e) => setMaxLot(e.target.value)}
//                     className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
//                   />
//                 </div>
//               </div>

//               <div className="flex flex-col">
//                 <label className="text-xs font-medium text-gray-500 mb-2">
//                   Year Built
//                 </label>
//                 <div className="flex items-center space-x-2">
//                   <input
//                     type="number"
//                     placeholder="Min"
//                     value={minYear}
//                     onChange={(e) => setMinYear(e.target.value)}
//                     className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
//                   />
//                   <input
//                     type="number"
//                     placeholder="Max"
//                     value={maxYear}
//                     onChange={(e) => setMaxYear(e.target.value)}
//                     className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
//                   />
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* BOTTOM DRAWER ACTION FOOTER */}
//           <div className="flex justify-end items-center gap-3 pt-4 border-t border-gray-100">
//             <Button
//               type="button"
//               variant="ghost"
//               onClick={handleClearFilters}
//               className="text-sm font-semibold text-gray-400 hover:bg-gray-100 hover:text-red-500 rounded-xl px-5"
//             >
//               Reset
//             </Button>

//             <Button
//               type="submit"
//               variant="default"
//               className="font-bold text-sm px-6 py-5 rounded-xl shadow-md transition-all flex items-center gap-2"
//             >
//               Apply Filters
//             </Button>
//           </div>
//         </form>

//         {/* --- CARDS DISPLAY GRID --- */}
//         {loading ? (
//           <div className="text-center py-24 text-gray-400 font-medium tracking-wide">
//             Syncing listing data database...
//           </div>
//         ) : listings.length === 0 ? (
//           <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200 text-gray-400">
//             No matching listings found. Try widening your search rules.
//           </div>
//         ) : (
//           <>
//             <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
//               {listings.map((listing) => {
//                 const firstPhoto =
//                   listing.photos && listing.photos.length > 0
//                     ? listing.photos[0]
//                     : "/placeholder-image.jpg";

//                 const detailPageUrl = `/listing/landing/${listing.property_category}/${listing.pid}/${formatString(listing.civic_address)}`;
//                 return (
//                   <Link
//                     href={detailPageUrl}
//                     key={listing.pid}
//                     className="block group focus:outline-none"
//                     rel="noopener noreferrer"
//                     target="_blank"
//                   >
//                     <div
//                       key={listing.pid}
//                       className="border border-gray-200/60 rounded-2xl overflow-hidden shadow-sm bg-white flex flex-col justify-between hover:shadow-md transition-all group"
//                     >
//                       <div>
//                         <div className="relative overflow-hidden">
//                           <img
//                             src={firstPhoto}
//                             alt="Property"
//                             className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-300"
//                           />
//                           {listing.market_status && (
//                             <span className="absolute top-3 left-3 bg-blue-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
//                               {listing.market_status}
//                             </span>
//                           )}
//                           <span className="absolute top-3 right-3 bg-gray-950/80 backdrop-blur-sm text-white text-[11px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
//                             {listing.property_category}
//                           </span>
//                         </div>

//                         <div className="p-5">
//                           <div className="flex justify-between items-start mb-2">
//                             <h3 className="text-2xl font-black text-gray-900">
//                               ${listing.asking_price?.toLocaleString() ?? "N/A"}
//                             </h3>
//                             <span className="text-[10px] font-mono text-gray-400 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
//                               MLS® {listing.mls_number ?? "N/A"}
//                             </span>
//                           </div>

//                           <h4 className="font-bold text-gray-800 text-base line-clamp-1">
//                             {listing.civic_address ?? "No Address"}
//                           </h4>
//                           <p className="text-sm text-gray-400 font-semibold mb-3">
//                             {listing.neighbourhood
//                               ? `${listing.neighbourhood}, `
//                               : ""}
//                             {listing.postal_code ?? ""}
//                           </p>

//                           <hr className="my-3 border-gray-100" />

//                           <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-xs font-bold text-gray-500 mb-2">
//                             {listing.property_category !== "land" && (
//                               <>
//                                 <div>
//                                   🛏️{" "}
//                                   <span className="font-black text-gray-800">
//                                     {listing.bedrooms ?? 0}
//                                   </span>{" "}
//                                   Beds
//                                 </div>
//                                 <div>
//                                   🛁{" "}
//                                   <span className="font-black text-gray-800">
//                                     {(listing.full_baths ?? 0) +
//                                       (listing.half_baths ? 0.5 : 0)}
//                                   </span>{" "}
//                                   Baths
//                                 </div>
//                               </>
//                             )}
//                             {listing.total_floor_area && (
//                               <div>
//                                 📐{" "}
//                                 <span className="font-black text-gray-800">
//                                   {listing.total_floor_area.toLocaleString()}
//                                 </span>{" "}
//                                 sqft
//                               </div>
//                             )}
//                             {listing.lot_size && (
//                               <div>
//                                 🌳{" "}
//                                 <span className="font-black text-gray-800">
//                                   {listing.lot_size.toLocaleString()}
//                                 </span>{" "}
//                                 sqft lot
//                               </div>
//                             )}
//                             {listing.year_built && (
//                               <div className="col-span-2 text-xs font-semibold text-gray-400">
//                                 🔨 Built in{" "}
//                                 <span className="text-gray-700">
//                                   {listing.year_built}
//                                 </span>
//                               </div>
//                             )}
//                           </div>
//                         </div>
//                       </div>
//                       <div className="bg-gray-50/50 px-5 py-3 border-t border-gray-100 text-[11px] font-medium text-gray-400 italic truncate">
//                         Office: {listing.listing_office ?? "N/A"}
//                       </div>
//                     </div>
//                   </Link>
//                 );
//               })}
//             </div>

//             {/* --- PAGINATION --- */}
//             <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-12 border-t pt-6 border-gray-200">
//               <p className="text-sm text-gray-500 font-medium">
//                 Page <span className="text-gray-900 font-bold">{page}</span> of{" "}
//                 <span className="text-gray-900 font-bold">{totalPages}</span>
//               </p>
//               <div className="flex items-center space-x-1 bg-gray-200/40 p-1 rounded-xl border border-gray-200/60 shadow-sm">
//                 <button
//                   type="button"
//                   onClick={() => setPage(1)}
//                   disabled={page === 1}
//                   className="p-2 rounded-lg text-gray-500 hover:bg-white disabled:opacity-20 transition-all"
//                 >
//                   «
//                 </button>
//                 <button
//                   type="button"
//                   onClick={() => setPage((p) => Math.max(1, p - 1))}
//                   disabled={page === 1}
//                   className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-white disabled:opacity-20 transition-all"
//                 >
//                   Prev
//                 </button>

//                 {Array.from({ length: totalPages }, (_, i) => {
//                   const num = i + 1;
//                   if (
//                     num === 1 ||
//                     num === totalPages ||
//                     Math.abs(num - page) <= 1
//                   ) {
//                     return (
//                       <button
//                         type="button"
//                         key={num}
//                         onClick={() => setPage(num)}
//                         className={`w-8 h-8 text-xs font-bold rounded-lg transition-all ${page === num ? "bg-blue-600 text-white shadow-sm" : "text-gray-600 hover:bg-white"}`}
//                       >
//                         {num}
//                       </button>
//                     );
//                   }
//                   if (num === page - 2 || num === page + 2)
//                     return (
//                       <span key={num} className="px-1 text-gray-400 text-xs">
//                         ...
//                       </span>
//                     );
//                   return null;
//                 })}

//                 <button
//                   type="button"
//                   onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
//                   disabled={page === totalPages}
//                   className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-white disabled:opacity-20 transition-all"
//                 >
//                   Next
//                 </button>
//                 <button
//                   type="button"
//                   onClick={() => setPage(totalPages)}
//                   disabled={page === totalPages}
//                   className="p-2 rounded-lg text-gray-500 hover:bg-white disabled:opacity-20 transition-all"
//                 >
//                   »
//                 </button>
//               </div>
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// }

// export default function Properties() {
//   return (
//     <AuthGuard renderPrivate={false}>
//       {(user, loginUI) => <AllListingsPage user={user} />}
//     </AuthGuard>
//   );
// }

"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/config/supabaseClient";
import Navbar from "../Navbar";
import { AuthGuard } from "../Auth/authGuard";
import { ListingFilters, FilterState } from "@/components/ListingFilters";
import { ListingCard, Listing } from "@/components/ListingCard";
import { deserializeFilters } from "@/lib/utils";

function AllListingsPage({ user }: { user: any }) {
  const searchParams = useSearchParams();
  const ITEMS_PER_PAGE = 16;

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  // Read URL fields straight into state variables
  const [appliedFilters, setAppliedFilters] = useState<FilterState>(() =>
    deserializeFilters(searchParams, user),
  );

  useEffect(() => {
    async function fetchListings() {
      setLoading(true);
      const from = (page - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      // Swap the target view based on the toggle
      const targetTable = appliedFilters.propertiesOnly
        ? "off_market_properties"
        : "all_listings";
      let query = supabase.from(targetTable).select("*", { count: "exact" });
      if (!appliedFilters.propertiesOnly) {
        if (!user) {
          query = query.in("market_status", ["Active"]);
        } else if (appliedFilters.status.length > 0) {
          query = query.in("market_status", appliedFilters.status);
        }

        if (appliedFilters.category.length > 0) {
          query = query.in("property_category", appliedFilters.category);
        }
        if (appliedFilters.minPrice) {
          query = query.gte(
            "asking_price",
            parseFloat(appliedFilters.minPrice),
          );
        }
        if (appliedFilters.maxPrice) {
          query = query.lte(
            "asking_price",
            parseFloat(appliedFilters.maxPrice),
          );
        }
      }

      // These apply to BOTH market and off-market
      if (appliedFilters.searchQuery) {
        // Off-market might not have MLS numbers, so handle safely
        query = query.or(
          `civic_address.ilike.%${appliedFilters.searchQuery}%,neighbourhood.ilike.%${appliedFilters.searchQuery}%${
            !appliedFilters.propertiesOnly
              ? `,mls_number.ilike.%${appliedFilters.searchQuery}%`
              : ""
          }`,
        );
      }

      if (appliedFilters.bedrooms)
        query = query.gte("bedrooms", parseInt(appliedFilters.bedrooms));
      if (appliedFilters.bathrooms)
        query = query.gte("full_baths", parseInt(appliedFilters.bathrooms));
      if (appliedFilters.minArea)
        query = query.gte("total_floor_area", parseInt(appliedFilters.minArea));
      if (appliedFilters.maxArea)
        query = query.lte("total_floor_area", parseInt(appliedFilters.maxArea));
      if (appliedFilters.minLot)
        query = query.gte("lot_size", parseInt(appliedFilters.minLot));
      if (appliedFilters.maxLot)
        query = query.lte("lot_size", parseInt(appliedFilters.maxLot));
      if (appliedFilters.minYear)
        query = query.gte("year_built", parseInt(appliedFilters.minYear));
      if (appliedFilters.maxYear)
        query = query.lte("year_built", parseInt(appliedFilters.maxYear));

      // Use a fallback sort if listing_date isn't on off-market properties
      const sortColumn = appliedFilters.propertiesOnly
        ? "civic_address"
        : "listing_date";
      const { data, count } = await query
        .order(sortColumn, {
          ascending: appliedFilters.propertiesOnly ? true : false,
        })
        .range(from, to);

      setListings(data || []);
      setTotalPages(Math.ceil((count ?? 0) / ITEMS_PER_PAGE));
      setLoading(false);
      window.scrollTo({ top: 0, behavior: "smooth" });

      // if (!user) {
      //   query = query.in("market_status", ["Active"]);
      // } else if (appliedFilters.status.length > 0) {
      //   query = query.in("market_status", appliedFilters.status);
      // }

      // if (appliedFilters.searchQuery) {
      //   query = query.or(
      //     `civic_address.ilike.%${appliedFilters.searchQuery}%,mls_number.ilike.%${appliedFilters.searchQuery}%,neighbourhood.ilike.%${appliedFilters.searchQuery}%`,
      //   );
      // }
      // if (appliedFilters.category.length > 0)
      //   query = query.in("property_category", appliedFilters.category);
      // if (appliedFilters.bedrooms)
      //   query = query.gte("bedrooms", parseInt(appliedFilters.bedrooms));
      // if (appliedFilters.bathrooms)
      //   query = query.gte("full_baths", parseInt(appliedFilters.bathrooms));
      // if (appliedFilters.minPrice)
      //   query = query.gte("asking_price", parseFloat(appliedFilters.minPrice));
      // if (appliedFilters.maxPrice)
      //   query = query.lte("asking_price", parseFloat(appliedFilters.maxPrice));
      // if (appliedFilters.minArea)
      //   query = query.gte("total_floor_area", parseInt(appliedFilters.minArea));
      // if (appliedFilters.maxArea)
      //   query = query.lte("total_floor_area", parseInt(appliedFilters.maxArea));
      // if (appliedFilters.minLot)
      //   query = query.gte("lot_size", parseInt(appliedFilters.minLot));
      // if (appliedFilters.maxLot)
      //   query = query.lte("lot_size", parseInt(appliedFilters.maxLot));
      // if (appliedFilters.minYear)
      //   query = query.gte("year_built", parseInt(appliedFilters.minYear));
      // if (appliedFilters.maxYear)
      //   query = query.lte("year_built", parseInt(appliedFilters.maxYear));

      // const { data, count } = await query
      //   .order("listing_date", { ascending: false })
      //   .range(from, to);
      // setListings(data || []);
      // setTotalPages(Math.ceil((count ?? 0) / ITEMS_PER_PAGE));
      // setLoading(false);
      // window.scrollTo({ top: 0, behavior: "smooth" });
    }

    fetchListings();
  }, [page, appliedFilters, user]);

  return (
    <div className="bg-background min-h-screen">
      <Navbar />
      <div className="pt-32 pb-16 px-6 bg-gray-50 min-h-screen font-sans">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8 tracking-tight">
          Search Squamish Real Estate and Homes for Sale
        </h1>

        {/* Exact same shared component */}
        <ListingFilters
          initialValues={appliedFilters}
          onChange={(newFilters) => {
            setPage(1);
            setAppliedFilters(newFilters);
          }}
          user={user}
        />

        {loading ? (
          <div className="text-center py-24 text-gray-400">
            Syncing database listings...
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {listings.map((listing) => (
                <ListingCard
                  key={listing.pid + "-" + listing.property_category}
                  listing={listing}
                />
              ))}
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-12 border-t pt-6 border-gray-200">
              <p className="text-sm text-gray-500 font-medium">
                Page <span className="text-gray-900 font-bold">{page}</span> of{" "}
                <span className="text-gray-900 font-bold">{totalPages}</span>
              </p>
              <div className="flex items-center space-x-1 bg-gray-200/40 p-1 rounded-xl border border-gray-200/60 shadow-sm">
                <button
                  type="button"
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                  className="p-2 rounded-lg text-gray-500 hover:bg-white disabled:opacity-20 transition-all"
                >
                  «
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-white disabled:opacity-20 transition-all"
                >
                  Prev
                </button>

                {Array.from({ length: totalPages }, (_, i) => {
                  const num = i + 1;
                  if (
                    num === 1 ||
                    num === totalPages ||
                    Math.abs(num - page) <= 1
                  ) {
                    return (
                      <button
                        type="button"
                        key={num}
                        onClick={() => setPage(num)}
                        className={`w-8 h-8 text-xs font-bold rounded-lg transition-all ${page === num ? "bg-blue-600 text-white shadow-sm" : "text-gray-600 hover:bg-white"}`}
                      >
                        {num}
                      </button>
                    );
                  }
                  if (num === page - 2 || num === page + 2)
                    return (
                      <span key={num} className="px-1 text-gray-400 text-xs">
                        ...
                      </span>
                    );
                  return null;
                })}

                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-white disabled:opacity-20 transition-all"
                >
                  Next
                </button>
                <button
                  type="button"
                  onClick={() => setPage(totalPages)}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg text-gray-500 hover:bg-white disabled:opacity-20 transition-all"
                >
                  »
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function Properties() {
  return (
    <AuthGuard renderPrivate={false}>
      {(user) => <AllListingsPage user={user} />}
    </AuthGuard>
  );
}

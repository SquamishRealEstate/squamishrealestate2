"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Lock } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce"; // Adjust import path as needed
import { Input } from "@/components/ui/input";

export type FilterState = {
  propertiesOnly: boolean;
  searchQuery: string;
  category: string[];
  status: string[];
  bedrooms: string;
  bathrooms: string;
  minPrice: string;
  maxPrice: string;
  minLot: string;
  maxLot: string;
  minArea: string;
  maxArea: string;
  minYear: string;
  maxYear: string;
};

interface ListingFiltersProps {
  initialValues: FilterState;
  onChange: (filters: FilterState) => void;
  user: any;
}

export function ListingFilters({
  initialValues,
  onChange,
  user,
}: ListingFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [propertiesOnly, setpropertiesOnly] = useState(
    initialValues.propertiesOnly,
  );

  // Raw local Input states
  const [searchQuery, setSearchQuery] = useState(initialValues.searchQuery);
  const [category, setCategory] = useState<string[]>(initialValues.category);
  const [status, setStatus] = useState<string[]>(initialValues.status);
  const [bedrooms, setBedrooms] = useState(initialValues.bedrooms);
  const [bathrooms, setBathrooms] = useState(initialValues.bathrooms);
  const [minPrice, setMinPrice] = useState(initialValues.minPrice);
  const [maxPrice, setMaxPrice] = useState(initialValues.maxPrice);
  const [minLot, setMinLot] = useState(initialValues.minLot);
  const [maxLot, setMaxLot] = useState(initialValues.maxLot);
  const [minArea, setMinArea] = useState(initialValues.minArea);
  const [maxArea, setMaxArea] = useState(initialValues.maxArea);
  const [minYear, setMinYear] = useState(initialValues.minYear);
  const [maxYear, setMaxYear] = useState(initialValues.maxYear);

  // Debounce the typed text/number states so they don't hammer Supabase
  const debouncedSearchQuery = useDebounce(searchQuery);
  const debouncedMinPrice = useDebounce(minPrice);
  const debouncedMaxPrice = useDebounce(maxPrice);
  const debouncedMinArea = useDebounce(minArea);
  const debouncedMaxArea = useDebounce(maxArea);
  const debouncedMinLot = useDebounce(minLot);
  const debouncedMaxLot = useDebounce(maxLot);
  const debouncedMinYear = useDebounce(minYear);
  const debouncedMaxYear = useDebounce(maxYear);

  // Sync up states if initialValues change externally
  useEffect(() => {
    setpropertiesOnly(initialValues.propertiesOnly);
    setSearchQuery(initialValues.searchQuery);
    setCategory(initialValues.category);
    setStatus(initialValues.status);
    setBedrooms(initialValues.bedrooms);
    setBathrooms(initialValues.bathrooms);
    setMinPrice(initialValues.minPrice);
    setMaxPrice(initialValues.maxPrice);
    setMinArea(initialValues.minArea);
    setMaxArea(initialValues.maxArea);
    setMinLot(initialValues.minLot);
    setMaxLot(initialValues.maxLot);
    setMinYear(initialValues.minYear);
    setMaxYear(initialValues.maxYear);
  }, [initialValues]);

  // Master Effect: Fires onChange automatically whenever an instant or debounced value mutates
  useEffect(() => {
    onChange({
      propertiesOnly,
      searchQuery: debouncedSearchQuery,
      category,
      status,
      bedrooms,
      bathrooms,
      minPrice: debouncedMinPrice,
      maxPrice: debouncedMaxPrice,
      minArea: debouncedMinArea,
      maxArea: debouncedMaxArea,
      minLot: debouncedMinLot,
      maxLot: debouncedMaxLot,
      minYear: debouncedMinYear,
      maxYear: debouncedMaxYear,
    });
  }, [
    propertiesOnly,
    debouncedSearchQuery,
    category,
    status,
    bedrooms,
    bathrooms,
    debouncedMinPrice,
    debouncedMaxPrice,
    debouncedMinArea,
    debouncedMaxArea,
    debouncedMinLot,
    debouncedMaxLot,
    debouncedMinYear,
    debouncedMaxYear,
  ]);

  const handleReset = () => {
    setpropertiesOnly(false);
    setSearchQuery("");
    setCategory([]);
    setStatus(user ? [] : ["Active"]);
    setBedrooms("");
    setBathrooms("");
    setMinPrice("");
    setMaxPrice("");
    setMinLot("");
    setMaxLot("");
    setMinArea("");
    setMaxArea("");
    setMinYear("");
    setMaxYear("");
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 space-y-6">
      <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-100">
        <div>
          <h3 className="text-sm font-bold text-gray-900">
            Squamish Properties
          </h3>
          <p className="text-xs text-gray-500">
            Search Active Listings (default) or toggle to search off market
            properties
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <Input
            type="checkbox"
            className="sr-only peer"
            checked={propertiesOnly}
            onChange={(e) => {
              setpropertiesOnly(e.target.checked);
              // Optional: Auto-clear conflicting filters when enabling off-market
              if (e.target.checked) {
                setCategory([]);
                setStatus([]);
                setMinPrice("");
                setMaxPrice("");
              }
            }}
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
        </label>
      </div>

      {/* ROW 1: PRIMARY TEXT SEARCH */}
      <div className="flex flex-col">
        <label className="text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider">
          Location / Keywords
        </label>
        <div className="relative">
          <Input
            type="text"
            placeholder="Search address, MLS® number, or neighborhood..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-gray-50/50 transition-all placeholder:text-gray-400"
          />
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
            🔍
          </span>
        </div>
      </div>

      {/* ROW 2: CATEGORY & STATUS BADGES (Updates instantly upon click) */}
      {!propertiesOnly && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
          <div className="flex flex-col space-y-2.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Property Types
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: "detached", label: "Detached" },
                { id: "strata", label: "Strata" },
                { id: "multifamily", label: "Multi-Family" },
                { id: "land", label: "Land" },
              ].map((type) => {
                const isSelected = category.includes(type.id);
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() =>
                      setCategory(
                        isSelected
                          ? category.filter((c) => c !== type.id)
                          : [...category, type.id],
                      )
                    }
                    className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all ${
                      isSelected
                        ? "bg-primary border-primary text-white shadow-xs"
                        : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {type.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col space-y-2.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Market Status
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: "Active", label: "Active" },
                { id: "Closed", label: "Sold" },
                { id: "Pending", label: "Pending" },
                { id: "Expired", label: "Expired" },
                { id: "Terminated", label: "Terminated" },
                // { id: "Cancel Protected", label: "Cancel Protected" },
              ].map((item) => {
                const isSelected = user
                  ? status.includes(item.id)
                  : item.id === "Active";

                const handleToggle = () => {
                  if (item.id === "Terminated") {
                    if (isSelected) {
                      // Remove both if currently selected
                      setStatus(
                        status.filter(
                          (s) => s !== "Terminated" && s !== "Cancel Protected",
                        ),
                      );
                    } else {
                      // Add both if currently not selected
                      setStatus([...status, "Terminated", "Cancel Protected"]);
                    }
                  } else {
                    // Standard toggle for other items
                    setStatus(
                      isSelected
                        ? status.filter((s) => s !== item.id)
                        : [...status, item.id],
                    );
                  }
                };
                return (
                  <button
                    key={item.id}
                    type="button"
                    disabled={!user}
                    onClick={() => handleToggle()}
                    className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-primary border-primary text-white shadow-xs"
                        : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                    } ${!user ? (isSelected ? "opacity-100 cursor-not-allowed" : "opacity-60 bg-gray-50 border-gray-100 text-gray-400 cursor-not-allowed") : ""}`}
                  >
                    <span>{item.label}</span>
                    {!user && item.id !== "Active" && (
                      <Lock className="size-3.5 opacity-80" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <hr className="border-gray-100 my-2" />

      {/* ROW 3: BEDS, BATHS, PRICE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
        {!propertiesOnly && (
          <div className="sm:col-span-2 flex flex-col">
            <label className="text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider">
              Price Range
            </label>
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                placeholder="$ Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full h-10 border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50/50"
              />
              <span className="text-gray-300 text-xs font-bold">to</span>
              <Input
                type="number"
                placeholder="$ Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full h-10 border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50/50"
              />
            </div>
          </div>
        )}

        <div className="flex flex-col">
          <label className="text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider">
            Beds
          </label>
          <select
            value={bedrooms}
            onChange={(e) => setBedrooms(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50/50 text-gray-700"
          >
            <option value="">Any Beds</option>
            <option value="1">1+ Beds</option>
            <option value="2">2+ Beds</option>
            <option value="3">3+ Beds</option>
            <option value="4">4+ Beds</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider">
            Baths
          </label>
          <select
            value={bathrooms}
            onChange={(e) => setBathrooms(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50/50 text-gray-700"
          >
            <option value="">Any Baths</option>
            <option value="1">1+ Baths</option>
            <option value="2">2+ Baths</option>
            <option value="3">3+ Baths</option>
          </select>
        </div>
      </div>

      {/* ADVANCED FILTER TOGGLE */}
      <div className="flex items-center justify-between pt-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleReset}
          className="text-xs font-bold text-gray-400 hover:text-red-500 hover:bg-white rounded-xl"
        >
          Reset Filters
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-xs font-bold text-gray-500 rounded-xl hover:text-white"
        >
          {showAdvanced ? (
            <>
              Hide Advanced <ChevronUp className="ml-1 size-4" />
            </>
          ) : (
            <>
              Show Advanced <ChevronDown className="ml-1 size-4" />
            </>
          )}
        </Button>
      </div>

      {/* COLLAPSIBLE DRAWER */}
      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-gray-100">
          <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-500 mb-2">
              Floor Area (sqft)
            </label>
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                placeholder="Min"
                value={minArea}
                onChange={(e) => setMinArea(e.target.value)}
                className="w-full h-10 border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50/50"
              />
              <Input
                type="number"
                placeholder="Max"
                value={maxArea}
                onChange={(e) => setMaxArea(e.target.value)}
                className="w-full h-10 border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50/50"
              />
            </div>
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-500 mb-2">
              Lot Size (sqft)
            </label>
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                placeholder="Min"
                value={minLot}
                onChange={(e) => setMinLot(e.target.value)}
                className="w-full h-10 border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50/50"
              />
              <Input
                type="number"
                placeholder="Max"
                value={maxLot}
                onChange={(e) => setMaxLot(e.target.value)}
                className="w-full h-10 border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50/50"
              />
            </div>
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-500 mb-2">
              Year Built
            </label>
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                placeholder="Min"
                value={minYear}
                onChange={(e) => setMinYear(e.target.value)}
                className="w-full h-10 border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50/50"
              />
              <Input
                type="number"
                placeholder="Max"
                value={maxYear}
                onChange={(e) => setMaxYear(e.target.value)}
                className="w-full h-10 border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50/50"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import Navbar from "@/components/Navbar";
import React, { useEffect, useState, useMemo } from "react";
import { supabase } from "@/config/supabaseClient";
import { useParams } from "next/navigation";
import { Check, Loader2, MessageSquare } from "lucide-react";
import Image from "next/image";
import {
  ListingGallery,
  OpenHousesSection,
  ScheduleTour,
  StartOffer,
  RequestInfo,
  ListingExplorerTabs,
} from "./listingHelpers";
import {
  BackToMapButton,
  SocialInteractions,
  ReviewsSummary,
  PropertyActions,
  Photos,
  FloorPlans,
  NearbyPhotos,
  BCAssessment,
  Taxes,
  SchoolPrograms,
  LastSold,
  PropertyReviews,
  ReviewForm,
  ReportAnIssueForm,
  ThinkingOfSelling,
} from "@/components/Property/PropertyHelpers";
import { AuthGuard } from "../Auth/authGuard";
import { useRouter } from "next/navigation";
import { ShareMenu } from "../ShareMenu";
import {
  MapPin,
  Clock,
  Home,
  Construction,
  Thermometer,
  Maximize,
  Bed,
  Bath,
  Car,
  Layers,
  CircleDollarSign,
  ChevronDown,
} from "lucide-react";
import {
  getElapsedTime,
  formatPrice,
  formatDate,
  getBathrooms,
  getGarageSituation,
  checkIfEmpty,
  formatTime,
  formatNumber,
} from "@/lib/utils";

export const ListingDetailPage = ({ type }: { type: string }) => {
  const { pid } = useParams();
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [listingAverageRating, setListingAverageRating] = useState<number>(0);
  const [reviews, setReviews] = useState<any[]>([]);
  const [fetchingReviews, setFetchingReviews] = useState(false);
  const [openhouses, setOpenHouses] = useState<any[]>([]);
  const router = useRouter();
  const reviewsRef = React.useRef<HTMLDivElement>(null);
  const reportRef = React.useRef<HTMLDivElement>(null);
  const [listingInfo, setListingInfo] = useState<any[]>([]);
  const [openAccordions, setOpenAccordions] = useState<{
    [key: number]: boolean;
  }>({});
  const [openReviews, setOpenReviews] = useState(false);

  const toggleAccordion = (index: number) => {
    setOpenAccordions((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };
  const features = useMemo(() => {
    if (!listing) return [];

    return [
      {
        name: "Type",
        value: listing.dwell_type || "-",
        icon: Home,
      },
      {
        name: "Year Built",
        value: listing.year_built === "9999" ? "-" : listing.year_built,
        icon: Construction,
      },
      {
        name: "Heating",
        value: type?.includes("land") ? "-" : listing.heating,
        icon: Thermometer,
      },
      {
        name: "Sqft",
        value: listing.total_floor_area
          ? `${formatNumber(listing.total_floor_area)} sf`
          : "-",
        icon: Maximize,
      },
      {
        name: "Bedrooms",
        value: listing.bedrooms || "-",
        icon: Bed,
      },
      {
        name: "Bathrooms",
        value: type?.includes("land")
          ? listing.bathrooms || "-"
          : getBathrooms(listing.full_baths, listing.half_baths),
        icon: Bath,
      },
      {
        name: "Garage",
        value: type?.includes("land")
          ? "-"
          : getGarageSituation(listing.parking),
        icon: Car,
      },
      {
        name: "Lot Size",
        value: listing.lot_size ? `${formatNumber(listing.lot_size)} sf` : "-",
        icon: Layers,
      },
      ...(type === "strata"
        ? [
            {
              name: "Strata Fee",
              value: listing.strata_fee,
              icon: CircleDollarSign,
            },
          ]
        : []),
    ];
  }, [listing, type]);

  useEffect(() => {
    const fetchListing = async () => {
      setLoading(true);
      const table = type + "_listings";
      const { data } = await supabase
        .from(table)
        .select("*")
        .eq("pid", pid)
        .single();

      let civicAddress = data.civic_address;

      // 2. Run your specific conditional formatting rule
      if (
        type === "detached" &&
        data.zone_desc === "Bare Land Strata" &&
        data.legal_detail
      ) {
        // Regex looks for the word "Lot" followed by spaces, and captures the digits (\d+) right after it
        const lotMatch = data.legal_detail.match(/Lot\s+(\d+)/i);

        if (lotMatch) {
          const lotNumber = lotMatch[1]; // Extracts the captured digits (e.g., "7")
          civicAddress = `${lotNumber}-${data.civic_address}`;
        }
      }

      if (data) {
        data.civic_address = civicAddress; // Override with formatted address
        setListing(data);
      }
      setLoading(false);
    };
    if (pid) fetchListing();
  }, [pid, type]);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!listing?.pid) return;

      setFetchingReviews(true);

      const { data, error } = await supabase
        .from("property_reviews")
        .select("*")
        .eq("pid", listing.pid) // Filter by current property
        .eq("status", "approved") // Only show verified reviews
        .order("created_at", { ascending: false }); // Newest first

      if (error) {
        console.error("Error fetching reviews:", error);
      } else {
        setReviews(data || []);
        let averageRating = 0;
        if (data && data.length > 0) {
          const totalScore = data.reduce(
            (sum, review) => sum + (review.property_score || 0),
            0,
          );
          const rawAverage = totalScore / data.length;

          // 2. Round to 1 decimal place (e.g., 4.5)
          averageRating = Math.round(rawAverage * 10) / 10;
        }

        // 3. Update States
        setListingAverageRating(averageRating);
      }
      setFetchingReviews(false);
    };

    fetchReviews();

    const listingInfo = [
      {
        name: `Sold History`,
        component: LastSold,
      },
      { name: `Photos (${listing?.photos?.length || 0})`, component: Photos },
      { name: `Floor Plans (0)`, component: FloorPlans },
      { name: "Nearby Photos", component: NearbyPhotos },
      { name: "BC Assessment", component: BCAssessment },
      { name: "Taxes", component: Taxes },
      { name: "School Programs", component: SchoolPrograms },
    ];

    setListingInfo(listingInfo);

    const fetchOpenHouses = async () => {
      if (!listing?.listing_id) return;

      console.log(
        "Fetching open house data for listing_id:",
        listing.listing_id,
      );

      const { data, error } = await supabase
        .from("openhouse_listings")
        .select("*")
        .eq("listing_id", listing.listing_id)
        .order("start_timestamp", { ascending: true });

      if (error) {
        console.error("Error fetching open house data:", error);
      }

      setOpenHouses(data || []);

      console.log("Open House Data:", data, "Error:", error);
    };

    fetchOpenHouses();
  }, [listing]);

  if (loading)
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary mb-2" />
        <p className="text-[10px] uppercase tracking-widest font-bold text-secondary">
          Loading Listing Detail...
        </p>
      </div>
    );

  if (!listing && !loading)
    return (
      <div className="p-20 text-center font-display text-xl">
        Listing not found.
      </div>
    );

  const scrollToRef = (
    ref: React.RefObject<HTMLDivElement> | any,
    value: string,
  ) => {
    ref?.current?.scrollIntoView({ behavior: "smooth" });
    if (ref?.current instanceof HTMLInputElement) {
      ref.current.checked = true;
    }
  };

  return (
    <div className="bg-background min-h-screen flex flex-col">
      <Navbar />
      <div className="relative mb-2 pt-20">
        <BackToMapButton onClick={() => router.push("/")} />
        <ListingGallery listing={listing} />
        <div className="absolute bottom-6 left-6 right-auto md:bottom-12 md:left-12 md:right-auto flex flex-col items-start gap-3 z-10 pointer-events-none">
          <div className="bg-black/30 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl overflow-hidden pointer-events-auto">
            <AuthGuard renderPrivate={false}>
              {(user, loginUI) => (
                <SocialInteractions pid={listing.pid} user={user} />
              )}
            </AuthGuard>
          </div>

          {/* Reviews Summary */}
          <div className="bg-black/30 backdrop-blur-md rounded-xl border border-white/10 shadow-2xl px-4 py-2 pointer-events-auto">
            <ReviewsSummary
              averageRating={listingAverageRating || 0}
              reviewCount={reviews?.length || 0}
            />
          </div>
        </div>
      </div>
      <div className="bg-white border-b border-gray-100">
        <div className="mx-auto px-6 md:px-12 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          {/* Left Side: Optional breadcrumbs or status (Keep empty if not needed) */}
          <div className="hidden md:block">
            <span className="text-sm uppercase tracking-widest text-gray-400 font-bold">
              Listing Overview
            </span>
          </div>

          {/* Right Side: Your Components Stacked */}
          <div className="w-full md:w-auto flex flex-col items-end gap-3">
            {/* Action Buttons */}
            <div className="flex items-center gap-4 py-1">
              <PropertyActions
                onWriteReview={() => scrollToRef(reviewsRef, "reviews")}
                onReport={() => scrollToRef(reportRef, "report an issue")}
              />
              <div className="h-4 w-px bg-gray-200" />
              <ShareMenu title={listing?.civic_address} />
            </div>
          </div>
        </div>
      </div>
      <div className="bg-card border-b border-border p-6 md:p-8 pt-10 antialiased lg:flex">
        <div className="w-full lg:w-2/3 space-y-4">
          <div className="flex flex-col gap-5 mt-4 md:flex-row md:items-start md:justify-between pb-8 border-b border-border">
            {/* LEFT SECTION */}
            <div className="flex flex-col gap-3 flex-1 min-w-0">
              {/* Address */}
              <div className="flex items-start gap-2">
                <MapPin className="h-5 w-5 text-primary shrink-0 mt-1" />

                <h1 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-foreground leading-tight break-words">
                  {listing?.civic_address}
                </h1>
              </div>

              {/* Metadata */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-sm font-medium">
                {/* MLS */}
                <div className="inline-flex items-center rounded-md bg-muted px-2.5 py-1 text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground border border-border">
                  <span className="opacity-60 font-normal mr-1.5 font-accent">
                    MLS®
                  </span>

                  {listing?.mls_number || "—"}
                </div>

                {/* Status */}
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] sm:text-xs font-semibold tracking-wide border shadow-xs whitespace-nowrap ${
                    listing?.market_status?.toLowerCase() === "active"
                      ? "bg-primary/10 text-primary border-primary/30"
                      : "bg-accent/10 text-accent border-accent/30"
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full mr-1.5 relative flex">
                    <span
                      className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                        listing?.market_status?.toLowerCase() === "active"
                          ? "bg-primary"
                          : "bg-accent"
                      }`}
                    />

                    <span
                      className={`relative inline-flex rounded-full h-1.5 w-1.5 ${
                        listing?.market_status?.toLowerCase() === "active"
                          ? "bg-primary"
                          : "bg-accent"
                      }`}
                    />
                  </span>

                  {listing?.market_status || "Unknown"}
                </span>

                {/* Time on Site */}
                <div className="inline-flex items-center text-muted-foreground text-xs sm:text-sm">
                  <Clock className="h-4 w-4 mr-1.5 opacity-70 shrink-0" />

                  <span className="font-body whitespace-nowrap">
                    {getElapsedTime(listing?.listing_date)} on site
                  </span>
                </div>
              </div>

              {/* Extra Info */}
              {(listing.market_status === "Pending" ||
                listing.market_status === "Closed" ||
                listing.market_status === "Active Under Contract") && (
                <div className="text-sm text-muted-foreground">
                  {listing.market_status === "Pending" ||
                  listing.market_status === "Closed" ? (
                    <>
                      <span className="font-semibold text-foreground">
                        Sold Price:
                      </span>{" "}
                      {formatPrice(listing.sold_price)}
                    </>
                  ) : (
                    <>
                      <span className="font-semibold text-foreground">
                        Subject Removal Date:
                      </span>{" "}
                      {formatDate(listing.subject_removal_date)}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* RIGHT SECTION */}
            <div className="flex flex-row items-end justify-between md:flex-col md:items-end md:text-right border-t pt-4 md:border-0 md:pt-0">
              <div>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                  {formatPrice(listing.asking_price)}
                </p>

                {listing.total_floor_area && (
                  <p className="text-xs sm:text-sm tracking-wide text-muted-foreground">
                    {formatPrice(
                      Math.round(
                        parseFloat(listing.asking_price) /
                          parseFloat(listing.total_floor_area),
                      ),
                    )}
                    /sf
                  </p>
                )}
              </div>
            </div>
          </div>
          {listing.listing_remarks && listing.listing_remarks !== "None" ? (
            <div className="pb-8 border-b border-border">
              <div>
                <h2 className="text-sm sm:text-base md:text-lg font-semibold text-foreground mb-3 tracking-tight">
                  Description
                </h2>

                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed whitespace-pre-line">
                  {listing.listing_remarks}
                </p>
              </div>
            </div>
          ) : null}

          <div className="pb-8 border-b border-border">
            <h2 className="text-sm sm:text-base md:text-lg font-semibold text-foreground mb-3 tracking-tight">
              Features
            </h2>
            <div className="grid grid-flow-col grid-rows-4 md:grid-rows-3 bg-white gap-y-10 gap-x-6 mt-4">
              {features.map((feature, index) => (
                <div
                  className="flex items-start gap-x-4 min-w-0 group"
                  key={index}
                >
                  {/* Icon matches the stroke and color logic of the inactive tabs */}
                  <feature.icon
                    size={20}
                    strokeWidth={1.5}
                    className="text-slate-400 flex-none mt-0.5 group-hover:text-brand transition-colors"
                  />

                  <div className="flex flex-col min-w-0">
                    {/* Matches the 'uppercase tracking-widest' style of your tabs */}
                    <p className="text-[10px] md:text-[11px] uppercase tracking-[0.12em] text-slate-400 font-bold leading-none mb-2">
                      {feature.name}
                    </p>

                    <p className="text-sm font-bold text-slate-800 truncate leading-tight">
                      {checkIfEmpty(feature.value)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="pb-8 border-b border-border">
            <h2 className="text-sm sm:text-base md:text-lg font-semibold text-foreground mb-3 tracking-tight">
              Amenities
            </h2>

            {!type?.includes("land") &&
            Array.isArray(listing?.amenities) &&
            listing.amenities.length > 0 ? (
              /* 🌟 Dynamic Layout: Wraps naturally according to exact text length with consistent padding */
              <div className="flex flex-wrap gap-2.5">
                {listing.amenities.map((amenity: string, index: number) => (
                  <div
                    className="inline-flex items-center gap-2 bg-muted/40 border border-border/40 rounded-lg px-3.5 py-1.5 transition-colors duration-150"
                    key={index}
                  >
                    {/* Accent Forest Green Checkmark */}
                    <Check className="h-3.5 w-3.5 text-primary shrink-0 opacity-90" />
                    <span className="text-muted-foreground text-xs sm:text-sm tracking-wide font-medium font-body whitespace-nowrap">
                      {amenity}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-muted-foreground text-sm tracking-wide font-body block pl-0.5">
                None Available
              </span>
            )}
          </div>
          <div className="p-2 pb-8 text-right">
            <p className="text-xs md:text-sm">
              Listing By{" "}
              <span className="font-bold italic">{listing.listing_office}</span>
            </p>
          </div>
          <div className="p-2 pb-8 flex items-center">
            <Image
              src="/images/mlsrlogo.png"
              alt="MLS Logo"
              width={300}
              height={300}
            />
            <p className="text-xs md:text-sm pl-4">
              This representation is based in whole or in part on data generated
              by the Chilliwack and District Real Estate Board, Fraser Valley
              Real Estate Board or Greater Vancouver REALTORS® which assume no
              responsibility for its accuracy{" "}
            </p>
          </div>
          <AuthGuard renderPrivate={false}>
            {(user, loginUI) => {
              return (
                <div className="space-y-6 border-b border-border pb-8">
                  {listingInfo.map((info, index) => {
                    const isPublic = info.name === "Nearby Photos";
                    const listingType = type + "Listing";

                    return (
                      <div
                        className="bg-white shadow-sm rounded-none overflow-hidden"
                        ref={info.ref}
                        key={index}
                      >
                        <button
                          onClick={() => toggleAccordion(index)}
                          className={`w-full flex justify-between items-center px-6 py-4 transition-all duration-300 ${
                            openAccordions[index]
                              ? "bg-primary text-primary-foreground"
                              : "bg-white text-foreground hover:bg-muted"
                          }`}
                        >
                          <span className=" font-bold uppercase tracking-[0.12em] text-[11px] md:text-xs">
                            {info.name === "Sold History" && user
                              ? `Sold History (${formatDate(listing.last_mls_date)})`
                              : info.name}
                          </span>
                          <span
                            className={`transform transition-transform duration-300 ${openAccordions[index] ? "rotate-180" : ""}`}
                          >
                            {/* Using a Lucide chevron or simple plus/minus */}
                            {openAccordions[index] ? "−" : "+"}
                          </span>
                        </button>

                        {openAccordions[index] && (
                          <div className="p-6 border-t border-border animate-in slide-in-from-top-2 duration-300">
                            {isPublic ? (
                              React.createElement(info.component, {
                                property: listing,
                                type: listingType,
                              })
                            ) : (
                              <AuthGuard
                                message={`Real Estate Board rules require registration to access ${
                                  info.name === "Taxes"
                                    ? "Tax Data"
                                    : "Listing Data"
                                }.`}
                              >
                                <div className="overflow-x-auto">
                                  {info.name.includes("Floor Plans") ? (
                                    <div>Coming Soon</div>
                                  ) : info.name.includes("Photos") ? (
                                    React.createElement(info.component, {
                                      photos: listing.photos,
                                    })
                                  ) : (
                                    React.createElement(info.component, {
                                      property: listing,
                                      type: listingType,
                                    })
                                  )}
                                </div>
                              </AuthGuard>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            }}
          </AuthGuard>

          <OpenHousesSection openhouses={openhouses} listing={listing} />

          <div className="bg-white border border-border shadow-sm rounded-none antialiased font-body mb-8">
            <button
              onClick={() => setOpenReviews(!openReviews)} // Assuming you have this state
              className="w-full flex items-center justify-between p-6 bg-white hover:bg-slate-50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <MessageSquare
                  size={18}
                  className="text-slate-400 group-hover:text-brand"
                />
                <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-slate-800">
                  Property Reviews ({reviews?.length || 0})
                </h3>
              </div>
              <div
                className={`transition-transform duration-300 ${openReviews ? "rotate-180" : ""}`}
              >
                <ChevronDown size={18} className="text-slate-400" />
              </div>
            </button>
            {/* Accordion Content */}
            {openReviews && (
              <div className="p-6 border-t border-border bg-white animate-in slide-in-from-top-2 duration-300">
                {reviews && reviews.length > 0 ? (
                  <div className="divide-y divide-border">
                    <PropertyReviews reviews={reviews} />
                  </div>
                ) : (
                  /* Empty State */
                  <div className="py-12 text-center flex flex-col items-center justify-center">
                    <div className="w-12 h-12 bg-muted flex items-center justify-center mb-4">
                      <MessageSquare
                        className="text-muted-foreground/40"
                        size={20}
                      />
                    </div>
                    <p className="text-[11px] font-bold text-foreground mb-1 uppercase tracking-widest leading-none">
                      No reviews yet.
                    </p>
                    <p className="text-[10px] text-muted-foreground italic leading-relaxed max-w-[200px]">
                      Be the first to share your insights about this property!
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
          <div
            ref={reviewsRef}
            className="bg-white border border-border shadow-sm rounded-none antialiased font-body mb-8"
          >
            {/* Header remains public so users know what this section is */}
            <div className="px-6 py-4 border-b border-border bg-muted/30">
              <h4 className="uppercase tracking-[0.15em] text-[10px] text-primary font-bold">
                Add Property Review
              </h4>
            </div>

            <div className="p-0">
              {" "}
              {/* Removed padding here so AuthGuard can fill the width */}
              <AuthGuard renderPrivate={false}>
                {(user, loginUI) => (
                  <div className="p-6">
                    <ReviewForm user={user} property={listing} />
                  </div>
                )}
              </AuthGuard>
            </div>
          </div>
          {listing.virtual_tour?.includes("youtu.be") ? (
            <>
              <div className="p-2 pb-8 border-b-2 border-grayborder">
                <h2 className="text-sm sm:text-base md:text-lg font-semibold text-foreground mb-3 tracking-tight">
                  Virtual Tour
                </h2>
                <iframe
                  width="100%"
                  height="315"
                  src={`https://www.youtube.com/embed/${listing.virtual_tour.split("youtu.be/")[1]}`}
                  title="YouTube video player"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                ></iframe>
              </div>
            </>
          ) : listing.virtual_tour?.includes("matterport") ? (
            <>
              <div className="p-2 pb-8 border-b-2 border-grayborder">
                <h2 className="text-sm sm:text-base md:text-lg font-semibold text-foreground mb-3 tracking-tight">
                  Virtual Tour
                </h2>
                <iframe
                  width="100%"
                  height="315"
                  src={listing.virtual_tour}
                  title="YouTube video player"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                ></iframe>
              </div>
            </>
          ) : (
            <></>
          )}
        </div>

        <div className="lg:w-1/3 lg:pl-8">
          <AuthGuard renderPrivate={false}>
            {(user, loginUI) => <ListingExplorerTabs listing={listing} />}
          </AuthGuard>
          <ThinkingOfSelling />
          <AuthGuard renderPrivate={false}>
            {(user, loginUI) => (
              <div className="p-6">
                <ReportAnIssueForm
                  user={user}
                  property={listing}
                  reportRef={reportRef as React.RefObject<HTMLDivElement>}
                />
              </div>
            )}
          </AuthGuard>
          <Image
            src="/images/REMAX-Masters.jpg"
            alt="Squamish Real Estate Logo"
            style={{ display: "block", margin: "0 auto" }}
            height={80}
            width={80}
            priority
          ></Image>
        </div>
      </div>
    </div>
  );
};

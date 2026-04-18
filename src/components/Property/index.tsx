"use client";

import React, { useEffect, useState, Fragment, use, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/config/supabaseClient";
import { numberWithCommas, checkIfEmpty, formatString } from "@/lib/utils";
import {
  MapPin,
  Loader2,
  History,
  Image as ImageIcon,
  LineChart,
  DollarSign,
  Landmark,
  GraduationCap,
  Bed,
  Bath,
  Maximize,
  Clock,
  BarChart3,
  Ruler,
  TrendingUp,
  Lock,
  MessageSquare,
  CircleDollarSign,
  Briefcase,
  Home,
} from "lucide-react";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HDMyHomeWidgetComponent from "./HDMyHomeWidgetComponent";
import HDWidgetComponent from "./HDWidgetComponent";

// Import our new helpers
import {
  BackToMapButton,
  PropertyStat,
  SocialInteractions,
  ReviewsSummary,
  PropertyActions,
  NewListings,
  RecentSolds,
  PropertyReport,
  LastSold,
  Photos,
  FloorPlans,
  NearbyPhotos,
  BCAssessment,
  Taxes,
  SchoolPrograms,
  ReviewForm,
  PropertyReviews,
  ReportAnIssueForm,
  ThinkingOfSelling,
} from "@/components/Property/PropertyHelpers";
import { ShareMenu } from "../ShareMenu";
import { AuthGuard } from "../Auth/authGuard";

export const PropertyDetailPage = ({ type }: { type: string }) => {
  const { pid } = useParams();

  console.log("Type", type);
  // This will show every key-value pair in your console
  const router = useRouter();
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const salesHistoryRef = React.useRef<HTMLDivElement>(null);
  const photosRef = React.useRef<HTMLDivElement>(null);
  const detailsRef = React.useRef<any>(null);
  const floorPlansRef = React.useRef<HTMLDivElement>(null);
  const nearbyPhotosRef = React.useRef<HTMLDivElement>(null);
  const honestDoorPriceHistoryRef = React.useRef<HTMLDivElement>(null);
  const bcAssessmentRef = React.useRef<HTMLDivElement>(null);
  const taxesRef = React.useRef<HTMLDivElement>(null);
  const schoolProgramsRef = React.useRef<HTMLDivElement>(null);
  const reviewsRef = React.useRef<HTMLDivElement>(null);
  const reportRef = React.useRef<HTMLDivElement>(null);
  const [selectedItem, setSelectedItem] = useState<string>("");
  const [propertyDetails, setPropertyDetails] = useState<any[]>([]);
  const [honestDoorCurrentPrice, setHonestDoorCurrentPrice] =
    useState("Coming Soon");
  const [HonestDoorURL, setHonestDoorURL] = useState("");
  const [selectedExplorerTab, setSelectedExplorerTab] =
    useState<string>("New Listings");
  const [propertyInfo, setPropertyInfo] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [propertyAverageRating, setPropertyAverageRating] = useState<number>(0);
  const [fetchingReviews, setFetchingReviews] = useState(false);

  const [openAccordions, setOpenAccordions] = useState<{
    [key: number]: boolean;
  }>({});

  const toggleAccordion = (index: number) => {
    setOpenAccordions((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const formatTax = (inputTax: string) => {
    const [number, info] = inputTax.split(" ");
    const roundedNumber = Math.round(parseFloat(number) * 100) / 100;
    return `${roundedNumber.toFixed(2)} ${info}`;
  };

  const handleItemClick = (
    value: string,
    ref: React.RefObject<HTMLDivElement | null>,
  ) => {
    setSelectedItem(value);

    // 1. Dynamically find the index in propertyInfo where the ref matches
    const index = propertyInfo.findIndex((info) => info.ref === ref);

    if (index !== -1) {
      // 2. Open the accordion at that index
      toggleAccordion(index);

      // 3. Scroll to that section
      // Use a small timeout to allow the accordion content to start rendering
      setTimeout(() => {
        if (ref.current) {
          ref.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }, 100);
    }
  };

  useEffect(() => {
    const fetchProperty = async () => {
      setLoading(true);
      const table = type === "strata" ? "strata" : "parcels";
      const { data } = await supabase
        .from(table)
        .select("*")
        .eq("pid", pid)
        .single();
      if (data) setProperty(data);
      setLoading(false);
    };
    if (pid) fetchProperty();
  }, [pid, type]);

  useEffect(() => {
    if (property) {
      // Calculate age based on current year and year built
      const yearConstructed = property.year_constructed;
      const age =
        yearConstructed === "0"
          ? "-"
          : (new Date().getFullYear() - parseInt(yearConstructed)).toString();

      const propertyDetails = [
        { name: "Bedrooms", value: property.bedrooms, icon: Bed },
        { name: "Bathrooms", value: property.bathrooms, icon: Bath },
        {
          name: "Floor Area",
          value: `${numberWithCommas(property.floor_area)} sf`,
          icon: Maximize,
        },
        { name: "Age", value: age, icon: Clock },
        {
          name: "Tax",
          value: `$ ${formatTax(property.tax_paid)}`,
          icon: Landmark,
        },
        {
          name: "Tax Trend",
          value: property.tax_trend,
          icon: DollarSign,
        },
        {
          name: "Assessment Trend",
          value: property.bc_assessment_trend,
          icon: BarChart3,
        },
        {
          name: "Property Size",
          value: `${numberWithCommas(property.lot_size)} sf`,
          icon: Ruler,
        },
        {
          name: "Market Status",
          value: property.market_status,
          icon: TrendingUp,
        },
        {
          name: "HonestDoor Price",
          value: honestDoorCurrentPrice,
          icon: CircleDollarSign,
        },
        { name: "Street Average", value: "Coming Soon", icon: Briefcase },
        { name: "Appreciation/year", value: "Coming Soon", icon: Home },
      ];

      const propertyInfo = [
        {
          name: "Last Sold",
          component: LastSold,
          ref: salesHistoryRef,
        },
        {
          name: `Photos (${property.photos?.length})`,
          component: Photos,
          ref: photosRef,
        },
        {
          name: `Floor Plans (0)`,
          component: FloorPlans,
          ref: floorPlansRef,
        },
        {
          name: "Nearby Photos",
          component: NearbyPhotos,
          ref: nearbyPhotosRef,
        },
        {
          name: "HonestDoor Price History",
          component: NearbyPhotos,
          ref: honestDoorPriceHistoryRef,
        },
        {
          name: "BC Assessment",
          component: BCAssessment,
          ref: bcAssessmentRef,
        },
        { name: "Taxes", component: Taxes, ref: taxesRef },
        {
          name: "School Programs",
          component: SchoolPrograms,
          ref: schoolProgramsRef,
        },
      ];

      setPropertyInfo(propertyInfo);

      console.log("Property Details:", propertyDetails);
      setPropertyDetails(propertyDetails);

      const fetchReviews = async () => {
        if (!property?.pid) return;

        setFetchingReviews(true);

        const { data, error } = await supabase
          .from("property_reviews")
          .select("*")
          .eq("pid", property.pid) // Filter by current property
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
          setPropertyAverageRating(averageRating);
        }
        setFetchingReviews(false);
      };

      fetchReviews();
    }
  }, [property]);

  const propertyExplorer = [
    { name: "New Listings", component: NewListings },
    { name: "Recent Solds", component: RecentSolds },
    { name: "Property Report", component: PropertyReport },
  ];

  if (loading)
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary mb-2" />
        <p className="text-[10px] uppercase tracking-widest font-bold text-secondary">
          Loading Property Detail...
        </p>
      </div>
    );

  if (!property)
    return (
      <div className="p-20 text-center font-display text-xl">
        Property not found.
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

  const labelData = [
    {
      label: "Sales History",
      value: "sales history",
      icon: History,
      ref: salesHistoryRef,
    },
    { label: "Photos", value: "photos", icon: ImageIcon, ref: photosRef },
    {
      label: "HonestDoor Price",
      value: "honestdoor price history",
      icon: LineChart,
      ref: honestDoorPriceHistoryRef,
    },
    {
      label: "BC Assessment",
      value: "bc assessment",
      icon: DollarSign,
      ref: bcAssessmentRef,
    },
    { label: "Taxes", value: "taxes", icon: Landmark, ref: taxesRef },
    {
      label: "Schools",
      value: "school programs",
      icon: GraduationCap,
      ref: schoolProgramsRef,
    },
  ];
  return (
    <div className="bg-background min-h-screen flex flex-col">
      <Navbar />

      <main className="relative flex-1 flex flex-col">
        <BackToMapButton onClick={() => router.push("/")} />

        <div className="relative w-full h-[65vh] md:h-[75vh] overflow-hidden">
          <Image
            src="/images/landing.jpg"
            alt={property.civic_address}
            fill
            priority
            className="object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent h-40" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

          {/* Social Interactions Overlay */}
          {/* Social Interactions Wrapper - ADD relative z-50 */}
          <div className="absolute bottom-6 left-6 right-auto md:bottom-12 md:left-auto md:right-12 flex flex-col items-start md:items-end gap-3 z-10">
            <div className="bg-black/30 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl overflow-hidden pointer-events-auto">
              {/* <AuthGuard message="Sign in to interact with this property.">
                {(user) => (
                  <SocialInteractions pid={property.pid} user={user} />
                )}
              </AuthGuard> */}
              <SocialInteractions pid={property.pid} />
            </div>

            {/* Reviews Summary */}
            <div className="bg-black/30 backdrop-blur-md rounded-xl border border-white/10 shadow-2xl px-4 py-2 pointer-events-auto">
              <ReviewsSummary
                averageRating={propertyAverageRating || 0}
                reviewCount={reviews?.length || 0}
              />
            </div>
          </div>

          {/* Details Bottom Left */}
          <div className="absolute bottom-20 md:bottom-0 left-0 w-full p-6 md:p-12 lg:p-16 text-white pointer-events-none">
            <div className="max-w-7xl mx-auto pointer-events-auto">
              <div className="flex flex-col gap-3 mb-8">
                {/* Address and Location */}
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold leading-tight tracking-tight max-w-4xl">
                  {checkIfEmpty(property.civic_address)}
                </h1>
                <div className="flex items-center gap-2 text-white/70 text-base md:text-xl font-body">
                  <MapPin size={18} className="text-brand" />
                  <span>
                    {checkIfEmpty(property.neighbourhood)} &nbsp;·&nbsp;{" "}
                    {checkIfEmpty(property.postal_code)}
                  </span>
                </div>
              </div>

              {/* Data Row Grid */}
              <div className="hidden grid grid-cols-2 md:flex md:flex-wrap gap-x-12 gap-y-6 pt-8 border-t border-white/10">
                <PropertyStat label="Bedrooms" value={property.bedrooms} />
                <PropertyStat label="Bathrooms" value={property.bathrooms} />
                <PropertyStat
                  label="Floor Area"
                  value={numberWithCommas(property.floor_area)}
                  suffix="sqft"
                />
                <PropertyStat
                  label="Lot Size"
                  value={numberWithCommas(property.lot_size)}
                  suffix="sqft"
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      <div className="bg-white border-b border-gray-100">
        <div className="mx-auto px-6 md:px-12 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          {/* Left Side: Optional breadcrumbs or status (Keep empty if not needed) */}
          <div className="hidden md:block">
            <span className="text-sm uppercase tracking-widest text-gray-400 font-bold">
              Property Overview
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
              <ShareMenu title={property?.civic_address} />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-grayLight p-6 pt-10 antialiased lg:flex">
        <div className="w-full lg:w-2/3">
          <div className="hidden md:flex flex-wrap bg-white shadow-sm border border-gray-100 p-2">
            {labelData.map(({ label, value, icon, ref }) => (
              <div
                className={`relative flex items-center whitespace-nowrap gap-2 px-4 py-2.5 m-1 cursor-pointer transition-all rounded-full ${
                  selectedItem === value
                    ? "bg-brand bg-opacity-10 text-brand font-bold"
                    : "text-slate-500 font-semibold hover:bg-gray-100 hover:text-slate-700"
                }`}
                id={value}
                key={value}
                onClick={() => {
                  handleItemClick(value, ref);
                }}
              >
                {React.createElement(icon, {
                  className: `w-3.5 h-3.5 flex-shrink-0 ${
                    selectedItem === value ? "text-brand" : "text-slate-400"
                  }`,
                })}

                <span className="uppercase tracking-widest text-[10px] md:text-[11px]">
                  {label}
                </span>
              </div>
            ))}
          </div>

          <div
            ref={detailsRef}
            className="grid grid-cols-2 md:grid-cols-3 bg-white border border-gray-100 shadow-sm p-8 gap-y-10 gap-x-6 rounded-none mt-4"
          >
            {propertyDetails.map((detail, index) => (
              <div
                className="flex items-start gap-x-4 min-w-0 group"
                key={index}
              >
                {/* Icon matches the stroke and color logic of the inactive tabs */}
                <detail.icon
                  size={20}
                  strokeWidth={1.5}
                  className="text-slate-400 flex-none mt-0.5 group-hover:text-brand transition-colors"
                />

                <div className="flex flex-col min-w-0">
                  {/* Matches the 'uppercase tracking-widest' style of your tabs */}
                  <p className="text-[10px] md:text-[11px] uppercase tracking-[0.12em] text-slate-400 font-bold leading-none mb-2">
                    {detail.name}
                  </p>

                  {detail.name === "Market Status" &&
                  detail.value === "Active" ? (
                    <a
                      href={`/listing/landing/${type}/${encodeURIComponent(property.PID)}/${encodeURIComponent(formatString(property.civic_address))}`}
                      className="text-sm font-bold text-brand hover:underline truncate"
                    >
                      {checkIfEmpty(detail.value)}
                    </a>
                  ) : (
                    <p className="text-sm font-bold text-slate-800 truncate leading-tight">
                      {checkIfEmpty(detail.value)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white border border-gray-100 shadow-sm antialiased mt-4">
            {/* The Tab Headers */}
            <div className="flex flex-wrap w-full border-b border-gray-100">
              {propertyExplorer.map((info, index) => {
                const isActive = selectedExplorerTab === info.name;
                return (
                  <button
                    key={index}
                    onClick={() => setSelectedExplorerTab(info.name)}
                    className={`flex-1 flex justify-center items-center gap-2 px-2 py-4 uppercase tracking-[0.12em] text-[10px] md:text-[11px] font-bold transition-all relative ${
                      isActive
                        ? "text-brand bg-slate-50/50"
                        : "text-slate-400 hover:text-slate-600 hover:bg-gray-50"
                    }`}
                  >
                    {/* Active indicator line */}
                    {isActive && (
                      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-brand" />
                    )}

                    {/* Render the Lucide icon if you have it in your data, otherwise label only */}
                    <span className="text-center whitespace-nowrap">
                      {info.name}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Tab Content */}
            <div className="p-6 md:p-8">
              {propertyExplorer.map(
                (info, index) =>
                  selectedExplorerTab === info.name && (
                    <div
                      key={index}
                      className="animate-in fade-in duration-300"
                    >
                      {info.name === "New Listings" ? (
                        <NewListings />
                      ) : (
                        <AuthGuard message="Sign in to view historical sold data for this property.">
                          {(user) =>
                            info.name === "Recent Solds" ? (
                              <RecentSolds />
                            ) : (
                              <PropertyReport property={property} user={user} />
                            )
                          }
                        </AuthGuard>
                      )}
                    </div>
                  ),
              )}
            </div>
          </div>

          <div className="bg-white p-2 shadow-md mt-4 text-[#666666] mb-5">
            <div className="space-y-4 mb-10 antialiased">
              {propertyInfo.map((info, index) => {
                // Define which sections are public
                const isPublic =
                  info.name === "Nearby Photos" ||
                  info.name === "HonestDoor Price History";

                return (
                  <div
                    className="bg-white shadow-sm rounded-none overflow-hidden"
                    ref={info.ref}
                    key={index}
                  >
                    {/* Accordion Header */}
                    <button
                      onClick={() => toggleAccordion(index)}
                      className={`w-full flex justify-between items-center px-6 py-4 transition-all duration-300 ${
                        openAccordions[index]
                          ? "bg-primary text-primary-foreground"
                          : "bg-white text-foreground hover:bg-muted"
                      }`}
                    >
                      <span className=" font-bold uppercase tracking-[0.12em] text-[11px] md:text-xs">
                        {info.name}
                      </span>
                      <span
                        className={`transform transition-transform duration-300 ${openAccordions[index] ? "rotate-180" : ""}`}
                      >
                        {/* Using a Lucide chevron or simple plus/minus */}
                        {openAccordions[index] ? "−" : "+"}
                      </span>
                    </button>

                    {/* Accordion Content */}
                    {openAccordions[index] && (
                      <div className="p-6 border-t border-border animate-in slide-in-from-top-2 duration-300">
                        {isPublic ? (
                          /* PUBLIC CONTENT */
                          <div className="w-full">
                            {info.name === "HonestDoor Price History" ? (
                              //(
                              // (honestDoorPrice as any).PriceHistory && (honestDoorPrice as any).CurrentMonth ? (
                              //   <div className="flex flex-col items-center">
                              //      <div className="w-full lg:w-3/4 custom-chart-container mb-8">
                              //        {React.createElement(HonestDoorPriceChart, {
                              //           priceHistory: (honestDoorPrice as any).PriceHistory?.Value,
                              //           currentMonth: (honestDoorPrice as any).CurrentMonth?.Value,
                              //         })}
                              //      </div>
                              //      <HDMyHomeWidgetComponent />
                              //   </div>
                              // ) :
                              <div className="bg-white flex justify-center p-6 mb-5">
                                <HDMyHomeWidgetComponent />
                              </div>
                            ) : (
                              // <div className="py-20 text-center  uppercase tracking-widest text-muted-foreground text-xs">
                              //   Coming Soon
                              // </div>
                              React.createElement(info.component, {
                                property,
                                type,
                              })
                            )}
                          </div>
                        ) : (
                          /* PROTECTED CONTENT */
                          <AuthGuard
                            message={`Real Estate Board rules require registration to access ${
                              info.name === "Taxes"
                                ? "Tax Data"
                                : "Listing Data"
                            }.`}
                          >
                            <div className="overflow-x-auto">
                              {info.name.includes("Floor Plans") ? (
                                // floorPlanDocs && React.createElement(FloorPlans, {
                                //   getProperty,
                                //   propertyType,
                                //   floorPlanDocs,
                                // })
                                <div>Coming Soon</div>
                              ) : (
                                React.createElement(info.component, {
                                  property,
                                  type,
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
          </div>

          <div className="bg-white border border-border shadow-sm rounded-none antialiased font-body mb-8">
            {/* Header: Matching the Tab/Accordion style */}
            <div className="px-6 py-4 border-b border-border bg-muted/30">
              <h4 className="uppercase tracking-[0.15em] text-[10px] text-primary font-bold">
                Property Reviews ({reviews?.length || 0})
              </h4>
            </div>

            {/* Content: Clean and Focused */}
            <div className="divide-y divide-border border-x border-border">
              {reviews && reviews.length > 0 ? (
                <PropertyReviews reviews={reviews} />
              ) : (
                /* Empty State */
                <div className="p-16 text-center flex flex-col items-center justify-center">
                  <div className="w-12 h-12 bg-muted flex items-center justify-center mb-4">
                    <MessageSquare
                      className="text-muted-foreground/40"
                      size={20}
                    />
                  </div>
                  <p className="text-sm font-bold text-foreground mb-1 uppercase tracking-widest">
                    No reviews yet.
                  </p>
                  <p className="text-[11px] text-muted-foreground italic leading-relaxed max-w-[200px]">
                    Be the first to share your insights about this property!
                  </p>
                </div>
              )}
            </div>
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
              <AuthGuard message="Sign in to write a review for this property.">
                {(user) => (
                  <div className="p-6">
                    {/* user is now accessible here! */}
                    <ReviewForm property={property} user={user} />
                  </div>
                )}
              </AuthGuard>
            </div>
          </div>
        </div>
        <div className="lg:w-1/3 lg:pl-8">
          <div className="flex justify-center mb-5">
            <Image
              className="rounded-md"
              width={600}
              height={300}
              priority
              src={`https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/static/${property.longitude},${property.latitude},17,0/600x300?access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}`}
              alt=""
            ></Image>
          </div>
          <div className="bg-white flex justify-center mb-5">
            <HDWidgetComponent />
          </div>
          <AuthGuard message="Sign in to report an issue with this property listing.">
            {(user) => (
              <div ref={reportRef}>
                <ReportAnIssueForm
                  user={user}
                  property={property}
                  reportRef={reportRef as React.RefObject<HTMLDivElement>}
                />
              </div>
            )}
          </AuthGuard>
          <ThinkingOfSelling />
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
      <Footer />
    </div>
  );
};

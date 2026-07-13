import { SharedChecklist } from "./sharedChecklist";

export const HomeSellerChecklist = () => {
  const sellingItems = [
    {
      id: 1,
      text: "Create Squamish.realestate account",
      checked: false,
      isSubtask: false,
    },
    {
      id: 2,
      text: "View properties, compare values of similar homes",
      checked: false,
      isSubtask: false,
    },
    {
      id: 3,
      text: "Speak with Sean to discuss Phase 1 – Legal & Financial Groundwork",
      checked: false,
      isSubtask: false,
    },
    { id: 4, text: "Mortgage review", checked: false, isSubtask: true },
    { id: 5, text: "Title Review", checked: false, isSubtask: true },
    {
      id: 6,
      text: "Gather Strata Documents / review",
      checked: false,
      isSubtask: true,
    },
    { id: 7, text: "Access Tenancies", checked: false, isSubtask: true },
    {
      id: 8,
      text: "Phase 2 – Prep & Declutter",
      checked: false,
      isSubtask: false,
    },
    { id: 9, text: "The 50% Rule", checked: false, isSubtask: true },
    {
      id: 10,
      text: "Pack person items / Clear counters",
      checked: false,
      isSubtask: true,
    },
    {
      id: 11,
      text: "Deep clean glass & grout",
      checked: false,
      isSubtask: true,
    },
    {
      id: 12,
      text: "Pre-Listing Home Inspection",
      checked: false,
      isSubtask: true,
    },
    {
      id: 13,
      text: "Phase 3 - Outdoor & First Impressions",
      checked: false,
      isSubtask: false,
    },
    { id: 14, text: "Maximize Curb Appeal", checked: false, isSubtask: true },
    {
      id: 15,
      text: "Ensure the key features are presentable",
      checked: false,
      isSubtask: true,
    },
    {
      id: 16,
      text: "Complete the Property Disclosure Statement (PDS)",
      checked: false,
      isSubtask: true,
    },
    {
      id: 17,
      text: "Identify Inclusions & Remove Exclusions",
      checked: false,
      isSubtask: true,
    },
    {
      id: 18,
      text: "Phase 4 – Launch Listing",
      checked: false,
      isSubtask: false,
    },
    {
      id: 19,
      text: "Prepare For Media (photos, floor plans & feature sheet)",
      checked: false,
      isSubtask: true,
    },
    {
      id: 20,
      text: "Confirm Showing & Open House Schedule",
      checked: false,
      isSubtask: true,
    },
    { id: 21, text: "Complete Final Staging", checked: false, isSubtask: true },
    { id: 22, text: "Secure Valuables", checked: false, isSubtask: true },
    {
      id: 23,
      text: "Phase 5 – Prepare For Offer, Closing & Moving",
      checked: false,
      isSubtask: false,
    },
    {
      id: 24,
      text: "Contact lawyer / notary",
      checked: false,
      isSubtask: true,
    },
    {
      id: 25,
      text: "Contact lender / mortgage broker",
      checked: false,
      isSubtask: true,
    },
    {
      id: 26,
      text: "Fulfill conditions of the contract",
      checked: false,
      isSubtask: true,
    },
    {
      id: 27,
      text: "Contact movers & utility providers",
      checked: false,
      isSubtask: true,
    },
    { id: 28, text: "Property handover prep", checked: false, isSubtask: true },
  ]; //[cite: 2]

  return (
    <SharedChecklist
      title="Home Seller Checklist"
      subtitle="Preparing to Sell a property"
      fileName="Home_Seller_Checklist.txt"
      iconPath="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
      initialItems={sellingItems} //[cite: 2]
    />
  );
};

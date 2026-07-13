import { SharedChecklist } from "./sharedChecklist";

export const HomeBuyingChecklist = () => {
  const buyingItems = [
    { id: 1, text: "Create Squamish.realestate account", checked: false },
    { id: 2, text: "View properties, Save homes", checked: false },
    { id: 3, text: "Speak with Sean to discuss options", checked: false },
    { id: 4, text: "Mortgage pre-approval", checked: false },
    { id: 5, text: "Book showings", checked: false },
    { id: 6, text: "Make offer", checked: false },
    { id: 7, text: "Due diligence", checked: false },
    { id: 8, text: "Remove subjects", checked: false },
    { id: 9, text: "Prepare to move", checked: false },
    { id: 10, text: "Meet with lawyer / notary", checked: false },
    { id: 11, text: "Completion", checked: false },
  ];

  return (
    <SharedChecklist
      title="Home Buying Checklist"
      subtitle="Buying Journey"
      fileName="Home_Buying_Checklist.txt"
      iconPath="M13 10V3L4 14h7v7l9-11h-7z"
      initialItems={buyingItems}
    />
  );
};

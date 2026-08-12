import { useState } from "react";
import { ArrowRight, Info, Gift } from "lucide-react";

export const ReferralBalance = ({ user }: { user: any }) => {
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  const handleContact = async () => {
    if (status !== "idle") return;
    setStatus("loading");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateType: "REFERRAL_CREDIT",
          email: user?.email,
          name: user?.user_metadata?.full_name,
        }),
      });
      if (response.ok) setStatus("success");
      else setStatus("idle");

      setTimeout(() => setStatus("idle"), 3000);
    } catch (err) {
      setStatus("idle");
      console.error("Error contacting user:", err);
    }
  };

  return (
    <button
      onClick={handleContact}
      disabled={status !== "idle"}
      className="relative w-full text-left p-3 pb-6 bg-gradient-to-br from-accent/10 to-transparent border border-accent/20 rounded-xl shadow-sm hover:border-accent/40 transition-all cursor-pointer"
    >
      {/* Tooltip */}
      <div className="group absolute top-2 right-2 cursor-help z-20">
        <Info size={12} className="text-muted-foreground" />
        <div className="absolute right-0 top-full mt-2 w-48 p-2 bg-popover text-popover-foreground border border-border text-[9px] md:text-[10px] rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none">
          Cashback Credit of $1,000 or 10% of commission earned on your next Buy
          or Sell transaction.
        </div>
      </div>

      {/* Main Content */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-accent/20 text-accent rounded-full flex items-center justify-center shrink-0">
          <Gift size={15} />
        </div>
        <div>
          <span className="text-xs block md:text-sm font-bold text-foreground leading-tight">
            $1,000
          </span>
          <span className="text-[9px] md:text-[10px] block text-muted-foreground uppercase tracking-wider font-semibold">
            Buy or Sell Credit*
          </span>
        </div>
      </div>

      {/* "Learn More" - Now has dedicated space due to pb-8 in the button */}
      <div className="absolute bottom-2 right-3 flex items-center gap-1 text-[9px] md:text-[10px] font-bold uppercase text-accent">
        {status === "loading"
          ? "Sending Email..."
          : status === "success"
            ? "Check Your Inbox"
            : "Learn More"}
        {status === "idle" && <ArrowRight size={10} />}
      </div>
    </button>
  );
};

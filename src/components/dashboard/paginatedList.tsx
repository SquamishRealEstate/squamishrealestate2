import { TabDataState } from "@/components/dashboard";
import { ListingCard } from "@/components/ListingCard";
import { ReviewCard } from "@/components/Property/PropertyHelpers";
import { Loader2, MessageSquare, Star, Heart } from "lucide-react";

export const PaginatedList = ({
  tabState,
  activeTab,
  onLoadMore,
}: {
  tabState: TabDataState;
  activeTab: string;
  onLoadMore: () => void;
}) => {
  const { items, isLoading, hasMore, initialized } = tabState;

  if (!initialized && isLoading) {
    return (
      <div className="flex justify-center items-center py-24 h-full">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (!items.length) {
    return (
      <EmptyState
        icon={
          activeTab === "Messages"
            ? MessageSquare
            : activeTab === "Reviews"
              ? Star
              : Heart
        }
        title={`No ${activeTab.toLowerCase()} found`}
      />
    );
  }

  return (
    <div className="space-y-6">
      {(activeTab === "Saved" || activeTab === "Viewed") && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(
            (item, idx) =>
              item.property && (
                <ListingCard key={item.id || idx} listing={item.property} />
              ),
          )}
        </div>
      )}

      {activeTab === "Reviews" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {items.map(
            (item, idx) =>
              item.property && (
                <ReviewCard key={item.id || idx} review={item} />
              ),
          )}
        </div>
      )}

      {(activeTab === "Messages" || activeTab === "Issues") && (
        <div className="space-y-3">
          {items.map((item, idx) => {
            if (activeTab === "Messages")
              return <MessageItem key={item.id || idx} msg={item} />;
            // if (activeTab === "Issues")
            //   return <IssueItem key={item.id || idx} issue={item} />;
            return null;
          })}
        </div>
      )}

      {hasMore && (
        <div className="flex justify-center pt-8">
          <button
            onClick={onLoadMore}
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-2.5 bg-muted/50 border border-border text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground hover:border-primary rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading && <Loader2 className="animate-spin" size={14} />}
            {isLoading ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </div>
  );
};

const EmptyState = ({ icon: Icon, title }: any) => (
  <div className="text-center py-24 h-full flex flex-col items-center justify-center">
    <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4 border border-border">
      <Icon className="text-muted-foreground" size={24} />
    </div>
    <p className="font-semibold text-foreground text-base">{title}</p>
    <p className="text-sm text-muted-foreground mt-1">
      Looks like you don&apos;t have any activity here yet.
    </p>
  </div>
);

const MessageItem = ({ msg }: { msg: any }) => {
  const initials = msg.name
    ? msg.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "?";
  return (
    <div className="group border border-border rounded-xl p-4 hover:border-primary/50 transition-colors cursor-pointer bg-background flex gap-4 items-start shadow-sm hover:shadow">
      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0 border border-primary/20">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start gap-2 mb-0.5">
          <h3 className="text-sm font-semibold text-foreground truncate">
            {msg.name}
          </h3>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {new Date(msg.created_at).toLocaleDateString()}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mb-3 truncate">
          {msg.email}
        </p>
        <div className="text-sm text-foreground/90 bg-muted/30 p-3 rounded-lg border border-border/50 group-hover:bg-muted/50 transition-colors">
          <p className="line-clamp-2">{msg.message}</p>
        </div>
      </div>
    </div>
  );
};

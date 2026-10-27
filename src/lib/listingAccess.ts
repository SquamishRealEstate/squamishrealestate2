// Public listing pages and the sitemap use the same access rule: only
// Active listings are public. Expired, Sold, Terminated, and every other
// non-Active listing require member access and must stay out of the sitemap.
export function isPublicListingStatus(status: unknown): boolean {
  return (
    typeof status === "string" && status.trim().toLowerCase() === "active"
  );
}

export function isProtectedListingStatus(status: unknown): boolean {
  return !isPublicListingStatus(status);
}

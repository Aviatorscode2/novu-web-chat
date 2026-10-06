// Static demo data for the LaunchBoard dashboard. See README "Limitations" —
// this card is fixture data, not a real release-management backend.

export const release = {
  name: "Fall checkout release",
  version: "v2.4.0",
  status: "In staging" as const,
  targetDate: "2026-10-06",
};

export const checkoutError = {
  area: "Checkout",
  environment: "Staging",
  error: "Applying a coupon returns HTTP 500",
  team: "Platform",
};

// The exact prompt from the demo script. Sent verbatim (or as edited by the
// user) through the real useWebChat hook — never used to fabricate a reply.
export const suggestedPrompt =
  "Create a Linear issue for the checkout error in this release. Put it in the Platform team and include that applying a coupon returns a 500 in staging.";

// Client-safe region config. Only NEXT_PUBLIC_* values are read here.
// See https://docs.novu.co/agents/channels/web-chat (EU region section).
const EU_API_URL = "https://eu.api.novu.co";
const EU_SOCKET_URL = "wss://eu.socket.novu.co";

export function getNovuRegionUrls(): { apiUrl?: string; socketUrl?: string } {
  const explicitApiUrl = process.env.NEXT_PUBLIC_NOVU_API_URL;
  const explicitSocketUrl = process.env.NEXT_PUBLIC_NOVU_SOCKET_URL;
  if (explicitApiUrl || explicitSocketUrl) {
    return { apiUrl: explicitApiUrl, socketUrl: explicitSocketUrl };
  }

  const region = (process.env.NEXT_PUBLIC_NOVU_REGION || "us").toLowerCase();
  if (region === "eu") {
    return { apiUrl: EU_API_URL, socketUrl: EU_SOCKET_URL };
  }

  return {};
}

import { createClient } from "next-sanity";

// Lazy-loaded Sanity client to ensure environment variables are available
let clientInstance: ReturnType<typeof createClient> | null = null;

export function getSanityClient() {
  if (clientInstance) {
    return clientInstance;
  }

  // Validate required environment variables
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;

  if (!projectId) {
    throw new Error(
      "Missing NEXT_PUBLIC_SANITY_PROJECT_ID environment variable. " +
      "Please check your .env.local file and ensure Sanity credentials are configured."
    );
  }

  if (!dataset) {
    throw new Error(
      "Missing NEXT_PUBLIC_SANITY_DATASET environment variable. " +
      "Please check your .env.local file and ensure Sanity credentials are configured."
    );
  }

  clientInstance = createClient({
    projectId,
    dataset,
    apiVersion: "2024-01-01",
    useCdn: process.env.NODE_ENV === "production",
  });

  return clientInstance;
}

// Export the lazy-loaded client directly
export const Client = {
  fetch: (query: string, params?: Record<string, unknown>) => {
    return getSanityClient().fetch(query, params);
  }
};
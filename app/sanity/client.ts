import { createClient } from "next-sanity";

export const Client = createClient({
  projectId: "49hebsmj",
  dataset: "production",
  apiVersion: "2024-01-01",
  useCdn: false,
});

// Client-side client for browser usage
// export const clientSideClient = createClient({
//   projectId: "49hebsmj",
//   dataset: "production",
//   apiVersion: "2024-01-01",
//   useCdn: true, // Use CDN for client-side requests
// });

// Test client to check if project exists
// export const testClient = createClient({
//   projectId: "49hebsmj",
//   dataset: "production",
//   apiVersion: "2024-01-01",
//   useCdn: false,
//   token: undefined, // No token needed for public reads
// });
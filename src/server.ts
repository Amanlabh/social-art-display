
// This is a minimal version of server.ts that doesn't intercept real API calls
import { createServer } from "miragejs";

export function makeServer({ environment = "development" } = {}) {
  // No need to create server when we have a real database connection
  console.log("Using real database connection - skipping mock server");
  
  // Return a dummy server object that does nothing
  return {
    shutdown: () => {},
    pretender: {
      handledRequest: () => {}
    }
  };
}

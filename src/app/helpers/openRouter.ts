import { OpenRouter } from "@openrouter/sdk";
import config from "../../config";

export const openRouterclient = new OpenRouter({
  apiKey: config.open_router_api_key,
  // httpReferer: "<YOUR_SITE_URL>", // Optional. Site URL for rankings on openrouter.ai.
  // appTitle: "<YOUR_SITE_NAME>", // Optional. Site title for rankings on openrouter.ai.
});

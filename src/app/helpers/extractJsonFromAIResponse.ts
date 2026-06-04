import httpStatus from "http-status";
import ApiError from "../errors/ApiError";

export const extractJsonFromAIResponse = <T>(response: string): T => {
  try {
    const match = response.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);

    if (!match) {
      throw new Error("No JSON found in response");
    }

    return JSON.parse(match[0]);
  } catch (error) {
    console.error("AI Response:", response);

    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Failed to extract JSON from AI response",
    );
  }
};

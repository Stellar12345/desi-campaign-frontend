import { format as formatDate } from "date-fns";
import { AxiosError } from "axios";
import type { ApiResponse } from "@/types";

export const formatDateString = (dateString: string): string => {
  try {
    return formatDate(new Date(dateString), "MMM dd, yyyy");
  } catch {
    return dateString;
  }
};

export const formatDateTime = (dateString: string): string => {
  try {
    return formatDate(new Date(dateString), "MMM dd, yyyy HH:mm");
  } catch {
    return dateString;
  }
};

/**
 * Extracts error message from axios error response
 * Handles API response structure: { status: "ERROR", message: "...", ... }
 */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    // Check if error has response data with message
    const responseData = error.response?.data as ApiResponse<unknown> | undefined;
    if (responseData?.message) {
      return responseData.message;
    }
    // Fallback to error message
    if (error.message) {
      return error.message;
    }
  }
  
  // Handle regular Error objects
  if (error instanceof Error) {
    return error.message;
  }
  
  // Fallback
  return "An unexpected error occurred. Please try again.";
};

/**
 * Parses a phone number into country code and phone number
 * Handles formats like: "+1234567890", "+91 9876543210", "1234567890", etc.
 * @param phoneNumber - Full phone number string (may include country code)
 * @returns Object with countryCode and phone, or null if invalid
 */
export const parsePhoneNumber = (
  phoneNumber: string
): { countryCode: string; phone: string } | null => {
  if (!phoneNumber || phoneNumber.trim() === "") {
    return null;
  }

  // Remove all spaces, dashes, and parentheses
  const cleaned = phoneNumber.replace(/[\s\-\(\)]/g, "");

  // Check if it starts with +
  if (cleaned.startsWith("+")) {
    // Try to extract country code (1-4 digits after +)
    // Common country codes: +1 (US/CA), +44 (UK), +91 (India), +86 (China), etc.
    const match = cleaned.match(/^\+(\d{1,4})(\d+)$/);
    if (match) {
      return {
        countryCode: `+${match[1]}`,
        phone: match[2],
      };
    }
  }

  // If no +, check if it starts with common country codes
  // US/Canada: starts with 1 and has 10 more digits
  if (cleaned.match(/^1\d{10}$/)) {
    return {
      countryCode: "+1",
      phone: cleaned.substring(1),
    };
  }

  // India: starts with 91 and has 10 more digits
  if (cleaned.match(/^91\d{10}$/)) {
    return {
      countryCode: "+91",
      phone: cleaned.substring(2),
    };
  }

  // If no country code detected, return phone as-is with default country code
  // You can adjust the default based on your requirements
  return {
    countryCode: "+1", // Default to +1, adjust as needed
    phone: cleaned,
  };
};

import { format as formatDate } from "date-fns";

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

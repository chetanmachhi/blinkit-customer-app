import dayjs from "dayjs";

export const formatDate = (
  date: string | Date,
  format: string = "DD MMM YYYY, hh:mm A"
): string => {
  if (!date) return "";
  return dayjs(date).format(format);
};

export const formatTime = (date: string | Date): string => {
  if (!date) return "";
  return dayjs(date).format("hh:mm A");
};

export const formatShortDate = (date: string | Date): string => {
  if (!date) return "";
  return dayjs(date).format("DD MMM, YYYY");
};

export const formatEtaMinutes = (etaMinutes?: number | null): string => {
  if (!etaMinutes || etaMinutes <= 0) {
    return "10-15 mins";
  }
  return `${etaMinutes} mins`;
};

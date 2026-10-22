export const formatPaise = (
  paise: number,
  showDecimals: boolean = false
): string => {
  if (isNaN(paise) || paise === null || paise === undefined) {
    return "₹0";
  }

  const isNegative = paise < 0;
  const absPaise = Math.abs(Math.round(paise));
  const rupees = Math.floor(absPaise / 100);
  const remainder = absPaise % 100;

  const formattedRupees = rupees.toLocaleString("en-IN");

  let result = `₹${formattedRupees}`;
  if (showDecimals || remainder > 0) {
    result += `.${remainder.toString().padStart(2, "0")}`;
  }

  return isNegative ? `-${result}` : result;
};

export const paiseToRupees = (paise: number): number => {
  return Math.floor(paise / 100);
};

export const rupeesToPaise = (rupees: number): number => {
  return Math.round(rupees * 100);
};

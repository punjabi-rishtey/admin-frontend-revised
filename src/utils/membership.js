export const LIFETIME_PLAN_NAME = "Lifetime";
export const LIFETIME_PLAN_PRICE = 5000;
/** Schema placeholder month count for lifetime plans (not used for access). */
export const LIFETIME_SCHEMA_DURATION_MONTHS = 12;

export const parseIsLifetimeFlag = (value) =>
  value === true || value === "true" || value === 1 || value === "1";

export const isLifetimeMembershipRecord = (record) => {
  if (!record) return false;
  if (parseIsLifetimeFlag(record.isLifetime)) return true;
  return (
    String(record.name || record.planName || "")
      .trim()
      .toLowerCase() === LIFETIME_PLAN_NAME.toLowerCase()
  );
};

export const formatMembershipLength = (months) => {
  if (months === 12) return "1 year";
  if (months === 18) return "1.5 years";
  if (!months || !Number.isFinite(months) || months <= 0) return "";
  return `${months} month${months === 1 ? "" : "s"}`;
};

const isValidExpiryDate = (date) => {
  if (date === null || date === undefined || date === "") return false;
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return false;
  if (parsed.getFullYear() < 1971) return false;
  return true;
};

/** Human label for membership renewal / expiry (not message announcements). */
export const formatMembershipExpiry = (date, { isLifetime = false } = {}) => {
  if (isLifetime) return "No renewal";
  if (!isValidExpiryDate(date)) return "No renewal";
  return new Date(date).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const isMembershipDateExpired = (date, { isLifetime = false } = {}) => {
  if (isLifetime) return false;
  if (!isValidExpiryDate(date)) return false;
  return new Date(date) < new Date();
};

export const userHasLifetimeMembership = (user) => {
  if (!user || user.status !== "Approved") return false;
  if (user.metadata?.exp_date != null && user.metadata.exp_date !== "") {
    return false;
  }
  return isLifetimeMembershipRecord(user.subscription);
};

export const paymentPlanName = (payment, months) => {
  const storedName = String(payment?.planName || "").trim();
  if (storedName) return storedName;
  if (months === 18) return "Hallmark";
  if (months === 12) return "Gold";
  return "";
};

export const paymentAmount = (payment, months) => {
  const storedPrice = Number(payment?.planPrice);
  if (Number.isFinite(storedPrice) && storedPrice >= 0) return storedPrice;
  if (months === 18) return 3000;
  if (months === 12) return 2000;
  return null;
};

export const getPaymentDurationMonths = (payment) => {
  if (isLifetimeMembershipRecord(payment)) return null;

  const storedDuration = Number(payment?.membershipDurationMonths);
  if (Number.isInteger(storedDuration) && storedDuration > 0) {
    return storedDuration;
  }

  const start = new Date(payment?.createdAt);
  const end = new Date(payment?.expiresAt);

  if (
    Number.isNaN(start.getTime()) ||
    !isValidExpiryDate(payment?.expiresAt) ||
    end <= start
  ) {
    return null;
  }

  let months =
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth());

  if (months < 1) months = 1;

  const adjustedEnd = new Date(start);
  adjustedEnd.setMonth(adjustedEnd.getMonth() + months);
  if (adjustedEnd < end) months += 1;

  return months;
};
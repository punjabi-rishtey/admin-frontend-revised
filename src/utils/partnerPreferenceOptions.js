const optionMatchesValue = (optionValue, storedValue) => {
  const a = String(optionValue ?? "").trim();
  const b = String(storedValue ?? "").trim();
  return a === b || String(optionValue) === String(storedValue);
};

export const preferenceSelectOptions = (apiOptions, currentValue = "") => {
  const options = Array.isArray(apiOptions) ? apiOptions : [];
  const select = [{ value: "", label: "Select value" }, ...options];
  const raw = String(currentValue ?? "");
  const normalized = raw.trim();
  if (
    normalized &&
    !select.some((option) => optionMatchesValue(option.value, currentValue))
  ) {
    select.push({
      value: raw,
      label: `${normalized} (legacy — pick a new option to save)`,
    });
  }
  return select;
};

export const partnerPreferenceLabel = (apiOptions, value) => {
  if (!value) return "Not specified";
  const match = (apiOptions || []).find((option) =>
    optionMatchesValue(option.value, value)
  );
  const display = String(value).trim() || String(value);
  return match?.label || display;
};

const allowedValueSet = (apiOptions) =>
  new Set(
    (Array.isArray(apiOptions) ? apiOptions : []).map((option) =>
      String(option.value).trim()
    )
  );

/** Returns false when value is legacy / not in the API allowlist. */
export const isAllowedPartnerPreference = (apiOptions, value) => {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) return false;
  return allowedValueSet(apiOptions).has(trimmed);
};
export const toBoolean = (value: unknown): boolean | null => {
  if (typeof value === "boolean") return value;

  if (typeof value === "string") {
    const normalizedValue = value.trim().toLowerCase();

    if (normalizedValue === "true") return true;
    if (normalizedValue === "false") return false;
  }

  return null;
};



export const toNumber = (value: unknown): number | null => {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  const parsedNumber = Number(value);

  return Number.isNaN(parsedNumber) ? null : parsedNumber;
};

export const parseJsonField = (value: unknown) => {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  if (typeof value !== "string") {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};
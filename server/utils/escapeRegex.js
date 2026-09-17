// Escapes RegExp special characters so search input can be safely used
// inside a `new RegExp(...)` without breaking or enabling injection/ReDoS.
export const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Convert a Mongoose ValidationError into a simple object keyed by field
 * Each value will be the validation message for that field
 *
 * @param {object} err - Error object from Mongoose
 * @returns {object} field -> message
 */
export function formatValidationErrors(err) {
  if (!err || !err.errors || typeof err.errors !== 'object') return {};

  const structured = {};
  for (const key of Object.keys(err.errors)) {
    const e = err.errors[key];
    // Prefer the message property; fall back to other available traces
    structured[key] =
      (e && (e.message || (e.properties && e.properties.message))) || String(e);
  }
  return structured;
}

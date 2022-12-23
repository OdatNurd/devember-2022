// =============================================================================


/* A simple assertion function to verify that the public facing portions of the
 * API are being given arguments that make logical sense. */
export function assert(condition, message) {
  if (condition === false) {
    throw new Error(message || 'assertion failed')
  }
}


// =============================================================================

// why: gate draft error TEXT on a non-empty name — opening the dialog with
// an empty name (the add path) shouldn't immediately read "name must
// contain…". A caught submitError always shows; otherwise show draftError
// only when the user has actually typed something into the name field.
export function visibleCustomColorError(
  submitError: string | null,
  name: string,
  draftError: string | null,
): string | null {
  return submitError ?? (name.trim() ? draftError : null)
}

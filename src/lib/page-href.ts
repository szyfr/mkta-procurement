/**
 * Builds a list's pagination link. Page 1 is the bare path so the first page
 * and the unparameterized URL are the same place.
 */
export function buildPageHref(
  pathname: string,
  page: number,
  /** Any other URL state the list has to preserve, e.g. the cards/table view. */
  params = new URLSearchParams(),
) {
  if (page > 1) params.set("page", String(page));

  const query = params.toString();

  return query ? `${pathname}?${query}` : pathname;
}

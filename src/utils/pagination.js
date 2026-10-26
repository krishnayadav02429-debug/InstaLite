function validatePagination(page, limit) {
  if (page === undefined && limit === undefined) {
    return { page: 1, limit: 10, error: null };
  }
  const p = page !== undefined ? page : '1';
  const l = limit !== undefined ? limit : '10';
  if (p === '' || l === '' || !/^\d+$/.test(p) || !/^\d+$/.test(l)) {
    return { page: null, limit: null, error: 'page and limit must be positive integers' };
  }
  const pageInt = parseInt(p);
  const limitInt = parseInt(l);
  if (pageInt < 1 || limitInt < 1) {
    return { page: null, limit: null, error: 'page and limit must be positive integers' };
  }
  if (String(pageInt) !== p || String(limitInt) !== l) {
    return { page: null, limit: null, error: 'page and limit must be positive integers' };
  }
  const finalLimit = limitInt > 50 ? 50 : limitInt;
  return { page: pageInt, limit: finalLimit, error: null };
}

module.exports = { validatePagination };

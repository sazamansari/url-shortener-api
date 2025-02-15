const store = {}; // Global shared store

function getBaseUrl(req) {
  return req.protocol + '://' + req.get('host');
}

export { store, getBaseUrl };
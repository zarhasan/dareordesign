import LRUCache from 'lru-cache';

const options = {
  max: 5000,
  ttl: 1000 * 60 * 15,
  allowStale: false,
  updateAgeOnGet: false,
  updateAgeOnHas: false,
};

const lru = new LRUCache(options);

export { lru };

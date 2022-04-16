## Updating caches

### When adding a new DAO

- Add new DAO
- Replace src/cache/ec20Balances.json contents with an empty object `{}`
- Follow incremental update

### Incremental cache update

- Load the dashboard
- paste `JSON.stringify(eventCache)` into src/cache/ec20Balances.json. Remove the first and last quote.

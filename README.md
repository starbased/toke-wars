# Toke Wars

An informational dashboard for the [Tokemak](https://www.tokemak.xyz) cryptocurrency

## Development with a local db
### Setup

- `docker-compose up -d`
- `prisma migrate reset`
- Run once 
  - `yarn dev`
  - go to http://localhost:3000/api/updateEvents 
  If there are errors just refresh the page untill there are no errors.
  This populates all the watched event tables but infura sometimes throws errors
  - Stop yarn dev
- `yarn build`

The db should be in sync with production 

### Teardown

- `docker-compose down`


### Development
`yarn dev`

To add a new DAO update the daos and dao_addresses tables

All hashes are stored as bytea when inserting with sql use the following format: 
``` sql
insert into dao_addresses (name, address) values ('Redacted', '\x086C98855DF3C78C6B481B6E1D47BEF42E9AC36B'
```

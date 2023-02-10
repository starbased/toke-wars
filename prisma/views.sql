CREATE OR REPLACE FUNCTION bytea2numeric(_b BYTEA) RETURNS NUMERIC AS
$$
DECLARE
    _n NUMERIC := 0;
BEGIN
    FOR _i IN 0 .. LENGTH(_b) - 1
        LOOP
            _n := _n * 256 + GET_BYTE(_b, _i);
        END LOOP;
    RETURN _n;
END;
$$ LANGUAGE PLPGSQL IMMUTABLE
                    STRICT;


create or replace view acc_deposits as
select bytea2numeric(substring(data, 32, 1)) as numCycles,
       bytea2numeric(substring(data, 33))    as amount,
       substring(topics[3], 13)              as account,
       *
from events
where topics @> array [ '\x3c036a8b22a377ee5ff6738df5a3939854b2137f37e032634abcee2e1f6cccb6'::bytea]
  and address = '\xA374A62DDBD21E3D5716CB04821CB710897C0972'
;


create or replace view acc_withdrawals as
select bytea2numeric(data)      as amount,
       substring(topics[2], 13) as account,
       *
from events
where topics @> array [ '\x2f174ca282119315c59efaf21147aef438581dabdeb498198ae28964373dd8bc'::bytea]
  and address = '\xA374A62DDBD21E3D5716CB04821CB710897C0972'
;


create or replace view toke_staking_deposits_v as
select bytea2numeric(substring(data, 33, 32)) as amount,
       substring(data, 13, 20)                as account,
       *
from events
where topics @> array [ '\x73a19dd210f1a7f902193214c0ee91dd35ee5b4d920cba8d519eca65a7b488ca'::bytea]
  and address = '\x96F98Ed74639689C3A11daf38ef86E59F43417D3'
;

create or replace view toke_staking_withdrawals_v as
select bytea2numeric(substring(data, 65, 32)) as amount,
       substring(data, 13, 20)                as account,
       *
from events
where topics @> array [ '\x0502837c293951f8cf960d168bcedcf3e4531ffd7010af47fe48bbff7917d9b4'::bytea]
  and address = '\x96F98Ed74639689C3A11daf38ef86E59F43417D3'

union all

select bytea2numeric(substring(data, 33, 32)) as amount,
       substring(data, 13, 20)                as account,
       *
from events
where topics @> array [ '\xd083678824038160bef3975359ab29f19c3f0e9bcf9d7ead540a492d4d678b63'::bytea]
  and address = '\x96F98Ed74639689C3A11daf38ef86E59F43417D3'
;


create or replace view toke_staking_migrate_v as
select bytea2numeric(substring(data, 33, 32)) as amount,
       substring(data, 13, 20)                as account,
       *
from events
where topics @> array [ '\xd083678824038160bef3975359ab29f19c3f0e9bcf9d7ead540a492d4d678b63'::bytea]
  and address = '\x96F98Ed74639689C3A11daf38ef86E59F43417D3'
;


create or replace view erc20_deposit_v as
select substring(topics[3], 13, 20) as account,
       bytea2numeric(data)          as amount,
       *
from events
where topics @> array ['\xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'::bytea]
;

create or replace view erc20_withdrawals_v as
select substring(topics[2], 13, 20) as account,
       bytea2numeric(data)          as amount,
       *
from events
where topics @> array ['\xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'::bytea]
;


create view erc20_transfers_v as
SELECT "substring"(events.topics[2], 13, 20) AS "from",
       "substring"(events.topics[3], 13, 20) AS "to",
       bytea2numeric(events.data)            AS amount,
*
FROM events
WHERE events.topics @> ARRAY ['\xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'::bytea];


create or replace view dao_txs as
select transactions.*, dao_name
from (select amount as adjusted_value, account, address, block_number, transaction_hash, log_index
      from acc_deposits
      union all
      select -amount as adjusted_value, account, address, block_number, transaction_hash, log_index
      from acc_withdrawals

      union all

      select amount as adjusted_value, account, address, block_number, transaction_hash, log_index
      from toke_staking_deposits_v
      union all
      select -amount as adjusted_value, account, address, block_number, transaction_hash, log_index
      from toke_staking_withdrawals_v

      union all

      select adjusted_value, account, address, block_number, transaction_hash, log_index
      from (select amount as adjusted_value, *
            from erc20_deposit_v
            union all
            select -amount as adjusted_value, *
            from erc20_withdrawals_v) erc_20
      where topics && array(select ('\x000000000000000000000000' || substr(address::varchar, 3))::bytea
                            from dao_addresses)) transactions
         inner join dao_addresses on dao_addresses.address = transactions.account
;
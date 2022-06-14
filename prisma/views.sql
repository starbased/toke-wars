create or replace view dao_transactions_v as
select *
from (select "transactionHash" as transaction_hash,
             "blockNumber"     as block_number,
             address,
             "to"              as account,
             value             as adjusted_value
      from erc20_transfers
      union all
      select "transactionHash", "blockNumber", address, "from" as account, -1 * value
      from erc20_transfers
      union all
      select "transactionHash", "blockNumber", address, account, amount
      from toke_staking_deposits
      union all
      select "transactionHash", "blockNumber", address, account, amount * -1
      from toke_staking_withdraw_completed) transaction
where address in (
                  '\xA760E26AA76747020171FCF8BDA108DFDE8EB930',
                  '\x2E9D63788249371F1DFC918A52F8D799F4A38C94',
                  '\x96F98ED74639689C3A11DAF38EF86E59F43417D3'
    )
;
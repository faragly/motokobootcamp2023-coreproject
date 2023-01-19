principal_id="$1"
amount="$2"
dfx canister call mbt_ledger icrc1_transfer "( record {                   \
      to = record {                                                       \
          owner = principal \"${principal_id}\";                          \
          subaccount = null                                               \
      };                                                                  \
      from_subaccount = null;                                             \
      memo = null;                                                        \
      fee = opt 1_000_000;                                                \
      amount = ${amount};                                                 \
      created_at_time = null;                                             \
   })" 2> /dev/null
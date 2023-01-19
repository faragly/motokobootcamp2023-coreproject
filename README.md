# Motoko Bootcamp 2023 Core Project

## Local deployment
To deploy this project locally you need
- [Deploy **MBT ledger** canister](#mbt-ledger-deployment)
- Edit `dfx.json`, paste the local `canisterId` of `icrc1` obtained in the previous step at `canisters.mbt_ledger.remote.id.local`
- Install dependencies
```
npm i
vessel install
vessel verify --version 0.7.5
```
- Deploy canisters
```
dfx deploy
```

> 💀 **Note**: I did not make MB ledger part of this project through submodules in order not to complicate this project. It is only needed for local development.

### MBT ledger deployment
The MBT canister is based [on this](https://github.com/NatLabs/icrc1) implementation of the ICRC-1 standard.

- Install the mops package manager
- Run the following commands in terminal
```
git clone https://github.com/NatLabs/icrc1
cd icrc1
mops install
dfx start --background --clean
DEV_PRINCIPAL=$(dfx identity get-principal)
dfx deploy icrc1 --argument "( record {                       \
      name = \"Motoko Bootcamp Token\";                       \
      symbol = \"MBT\";                                       \
      decimals = 8;                                           \
      fee = 1_000_000;                                        \
      max_supply = 1_000_000_000_000;                         \
      initial_balances = vec {                                \
          record {                                            \
              record {                                        \
                  owner = principal \"$DEV_PRINCIPAL\";       \
                  subaccount = null;                          \
              };                                              \
              100_000_000_000                                 \
          }                                                   \
      };                                                      \
      min_burn_amount = 10_000_000;                           \
      minting_account = null;                                 \
      advanced_settings = null;                               \
  })"
```
- Get the ID of the deployed canister with the command
```
dfx canister id icrc1
```

### Transfer MBT locally
To simplify this process, I created a small script `transfer_mbt.sh` that takes 2 arguments - `principalId` and `amount` (in E8s). For example, if you want to send 1 MBT, you run the following command:
```
sh ./transfer_mbt.sh sepog-d772h-3irek-5lnnl-hqeap-savhq-ryrs7-naooh-zeogf-2xslv-eae 100000000
```
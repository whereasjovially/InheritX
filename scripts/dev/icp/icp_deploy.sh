#!/bin/bash

# Switching to Minter Identity
echo -e "\n Switching identity to Minter Princicpal......"
dfx identity new minter || true
dfx identity use minter
export MINT_ACC=$(dfx ledger account-id)
export MINTER_PRINCIPAL=$(dfx identity get-principal)

dfx identity use default
export LEDGER_ACC=$(dfx ledger account-id)
export LEDGER_PRINCIPAL=$(dfx identity get-principal)
# Change the variable to the principal that controls archive canisters.
dfx identity use default
export ARCHIVE_CONTROLLER=$(dfx identity get-principal)

export TOKEN_NAME="ICP"
export TOKEN_SYMBOL="ICP"

dfx canister uninstall-code icp_ledger || true

dfx identity use default

# Using this ledger.private.did
# dfx deploy icp_ledger --argument '(record {minting_account = "'${MINT_ACC}'";
# initial_values = vec { record {   "'$(dfx ledger account-id --of-principal up5qv-6itp6-z5fuj-kfq2a-qohj4-ckibb-lq6tt-34j2c-i2d27-3gqlm-pqe)'";
# record { e8s=1_000_000_000 } } }; send_whitelist = vec {}})' --specified-id ryjl3-tyaaa-aaaaa-aaaba-cai

dfx deploy icp_ledger --argument "(variant {Init =record {minting_account = \"${MINT_ACC}\";
initial_values = vec { record {  \"${LEDGER_ACC}\";
record { e8s=100_000_000_000 } } }; send_whitelist = vec {}}})" --specified-id ryjl3-tyaaa-aaaaa-aaaba-cai

# dfx deploy icp_ledger --argument "(variant {Init = record {

#   minting_account = \"${MINT_ACC}\";
#   initial_values = vec { record { account= \"b53f8879bd24d55dbd9ba16e796f9ccb5a94aa3d968e680d7ff64434f02961f9\"; record { e8s=100_000_000_000 } } };
#   send_whitelist = vec {};
#   archive_options = opt record {
#     trigger_threshold = 2000;
#     num_blocks_to_archive = 1000;
#     controller_id = principal \"${ARCHIVE_CONTROLLER}\";
#     cycles_for_archive_creation = opt 10_000_000_000_000;
#   }
# }})" --specified-id ryjl3-tyaaa-aaaaa-aaaba-cai

#                                            -------------Template-------------------

# dfx deploy icp_ledger --argument "(variant {Init = record {
#   token_name = opt \"${TOKEN_NAME}\";
#   token_symbol = opt \"${TOKEN_SYMBOL}\";
#   minting_account = \"${MINT_ACC}\";
#   initial_values = vec {};
#   send_whitelist = vec {};
#   archive_options = opt record {
#     trigger_threshold = 2000;
#     num_blocks_to_archive = 1000;
#     controller_id = principal \"${ARCHIVE_CONTROLLER}\";
#     cycles_for_archive_creation = opt 10_000_000_000_000;
#   }
# }})"

# dfx deploy icp_ledger --argument "(variant {Init = record { token_name = \"${TOKEN_NAME}\"; token_symbol = \"${TOKEN_SYMBOL}\"; transfer_fee = 10_000; metadata = vec {}; minting_account =  \"${MINT_ACC}\"; initial_values = vec { record {   \"${LEDGER_ACC}\"; record { e8s=1_000_000_000 } } }; send_whitelist = vec {} }})"

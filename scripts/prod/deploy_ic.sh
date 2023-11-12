#!/usr/bin/bash

# Deploying Canisters

# WILL Canister
ICRC_CANISTER_ID=awuug-kaaaa-aaaam-abt5a-cai PROVIDERS_CANISTER_ID=a7x72-4iaaa-aaaam-abt4q-cai BITCOIN_CANISTER_ID=xtlu4-6qaaa-aaaam-abx5q-cai dfx deploy --network ic will

# Providers Canister
WILL_CANISTER_ID=arvss-hyaaa-aaaam-abt5q-cai dfx deploy --network ic providers --specified-id 222l7-eqaaa-aaaar-aghea-cai

#  ICRC Canister
WILL_CANISTER_ID=arvss-hyaaa-aaaam-abt5q-cai dfx deploy --network ic icrc --specified-id aboy3-giaaa-aaaar-aaaaq-cai

cd canisters/bitcoin || true

# Bitcoin Canister
WILL_CANISTER_ID=arvss-hyaaa-aaaam-abt5q-cai dfx deploy --network ic bitcoin_canister --argument='(variant { Testnet })'

cd ../..
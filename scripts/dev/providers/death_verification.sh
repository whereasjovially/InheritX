#!/bin/bash

export TESTATOR_PRINCIPAL="fu727-7jdc5-rsfnw-jhdwu-n7ne3-4j4mc-7pvb4-bivf6-emr4q-q4svi-oqe"

export RIGHT_DEATH_USERID="ArUxoA1ZWJm6"
export OTHER_DEATH_USERID="AQZES9eluCUW"
export WRONG_DEATH_USERID="ArUxoA1ZWJm4"
dfx canister call providers check_testator_details_with_id \
    '(principal  "up5qv-6itp6-z5fuj-kfq2a-qohj4-ckibb-lq6tt-34j2c-i2d27-3gqlm-pqe","ArUxoA1ZWJm4", record 
{ firstNames= vec{"Concetina"};
  lastName= "Cosentino";
  sex= "F";
  birthDate= "19330807";
  birthLocationCode= "01202";
  deathDate= "20230130";
  deathLocationCode= "01004";})'

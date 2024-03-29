import {
  Duration,
  Opt,
  Principal,
  Record,
  Variant,
  Vec,
  nat,
  nat32,
} from "azle";

// User Details
export type UserDetails = Record<{
  principal: Principal;
  firstNames: Vec<string>;
  lastName: string;
  sex: string;
  birthDate: string;
  birthLocationCode: string;
}>;
export type userDetailsArgs = Record<{
  firstNames: Vec<string>;
  lastName: string;
  sex: string;
  birthDate: string;
  birthLocationCode: string;
}>;

// Return Type of AddUserDetail
export type AddUserDetails = Variant<{
  userExists: boolean;
  success: boolean;
}>;

// Return type of GetUserDetail
export type GetUserDetails = Variant<{
  userDetails: UserDetails;
  userNotExists: boolean;
}>;

//Return type of updateUserDetail
// Return Type of AddUserDetail
export type UpdateUserDetails = Variant<{
  userNotExists: boolean;
  success: boolean;
}>;

//------------------------------------------------------------------------------------------------------------------------//

//List of supported ICRC tokens
export const ICRCs = ["ICP", "ckBTC", "CHAT"];

// Type supported to create a will
export const tokenTickers = ["BTC"];

//stable Memory Type for Will
export type Will = Record<{
  willName: string;
  willDescription: string;
  identifier: nat32;
  tokenTicker: string;
  testator: Principal;
  heirs: Principal;
  value: nat;
  timeStamp: Duration;
  isClaimed: boolean;
}>;

export type ICRCCreateWill = Variant<{
  userNotExists: boolean;
  success: boolean;
  tokenTickerNotSupported: string;
  identifierUsed: boolean;
}>;

export type ICRCCreateWillArgs = Record<{
  willName: string;
  willDescription: string;
  identifier: nat32;
  heirs: Principal;
  tokenTicker: string;
  amount: nat;
}>;

export type ICRCDeleteWill = Variant<{
  isClaimed: boolean;
  tokenTickerNotSupported: boolean;
  retainError: string;
  icpRetainResult: Record<{
    retainICPMessage: string;
    success: boolean;
  }>;
  ckbtcRetainResult: Record<{
    retainCKBTCMessage: string;
    success: boolean;
  }>;
}>;

export type GetTestatorWills = Variant<{
  userNotExists: boolean;
  noWillsExists: boolean;
  wills: Vec<Will>;
}>;

export type GetHeirWills = Variant<{
  noWillsExists: boolean;
  wills: Vec<Will>;
}>;

export type CreateWillArgs = Variant<{
  icrc: ICRCCreateWillArgs;
  btc: BTCCreateWillArgs;
}>;

export type CreateWill = Variant<{
  userNotExists: boolean;
  willTypeNotSupported: boolean;
  icrc: ICRCCreateWill;
  btc: BTCCreateWill;
}>;

export type ClaimWill = Variant<{
  icrc: ICRCClaimWill;
  btc: BTCClaimWill;
  addressNull: boolean;
  willNotExists: boolean;
  unAuthorizedClaimer: boolean;
  claimError: boolean;
  willTypeNotSupported: boolean;
  claimErrorFromProvider: string;
  claimErrorFromCanisterCall: string;
}>;

export type ICRCClaimWill = Variant<{
  isClaimed: boolean;
  tokenTickerNotSupported: boolean;
  claimError: string;
  icpClaimResult: Record<{
    claimICPMessage: string;
    success: boolean;
  }>;
  ckbtcClaimResult: Record<{
    claimCKBTCMessage: string;
    success: boolean;
  }>;
}>;

export type DeleteWill = Variant<{
  userNotExists: boolean;
  identifierUsed: boolean;
  unAuthorizedTestator: boolean;
  willTypeNotSupported: boolean;
  willNotExists: boolean;
  addressNull: boolean;
  icrc: ICRCDeleteWill;
  btc: BTCDeleteWill;
}>;

export type ReportDeathByBase64Id = Variant<{
  willNotExists: boolean;
  testatorDetailsNotFound: string;
  errorMessageFromCanisterCall: string;
  errorMessageFromProviders: string;
  result: boolean;
}>;

export type CheckDeathByIdentifier = Variant<{
  willNotExists: boolean;
  errorMessageFromCanisterCall: string;
  result: boolean;
}>;

export type ClaimDeathOfTestatorByBase64ID = Variant<{
  noWillExists: boolean;
  errorMessage: string;
}>;

//============btc

export type BTCCreateWillArgs = Record<{
  willName: string;
  willDescription: string;
  identifier: nat32;
  heirs: Principal;
  tokenTicker: string;
  amountInSats: nat;
}>;
export type BTCCreateWill = Variant<{
  userNotExists: boolean;
  success: boolean;
  tokenTickerNotSupported: string;
  identifierUsed: boolean;
}>;

export type BTCDeleteWill = Variant<{
  isClaimed: boolean;
  tokenTickerNotSupported: boolean;
  retainError: string;
  btcRetainResult: Record<{
    retainBTCMessage: string;
    success: boolean;
    retainBTCError: Opt<string>;
  }>;
}>;

export type BTCClaimWill = Variant<{
  isClaimed: boolean;
  tokenTickerNotSupported: boolean;
  claimError: string;
  btcClaimResult: Record<{
    claimBTCMessage: string;
    success: boolean;
    claimBTCError: Opt<string>;
  }>;
}>;

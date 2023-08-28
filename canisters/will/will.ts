import {
  match,
  $update,
  nat32,
  $query,
  StableBTreeMap,
  Principal,
  ic,
  Opt,
  Vec,
  Tuple,
} from "azle";
import {
  GetTestatorWills,
  UserDetails,
  Will,
  GetHeirWills,
  CreateWill,
  CreateWillArgs,
  ICRCs,
  ClaimWill,
  DeleteWill,
} from "./utils/types";
import {
  add_user_details,
  is_user_exists,
  update_user_details,
  get_user_details,
} from "./users";
import { icrc_claim_will, icrc_create_will, icrc_delete_will } from "./icrc";

//=============================================Stable Variables===========================================================

//Store user details before creating any will
export let users = new StableBTreeMap<Principal, UserDetails>(1, 38, 500_000);

// Store digital will inside StableMemory with unique will_identifier
export let wills = new StableBTreeMap<nat32, Will>(2, 38, 500_000);

// testator principal mapping to will testator ==> will_identifer
export let testatorMappingToWillIdentifier = new StableBTreeMap<
  Principal,
  Vec<nat32>
>(3, 38, 500_000);

// heirs principal mapping to will heirs ==> will_identifer
export let heirsMappingToWillIdentifier = new StableBTreeMap<
  Principal,
  Vec<nat32>
>(4, 38, 500_000);

// stable memory that caches all Identifiers with respect to caller Principal
export let identifiersCache = new StableBTreeMap<nat32, Principal>(5, 32, 38);

// list of identifiers that are being used
export let isIdentifierUsed = new StableBTreeMap<nat32, boolean>(6, 32, 10);

//-------------------------------------------------------FUNCTIONS---------------------------------------------

// add will identifier to testators and heirs mappings
export function add_identifier_to_mapping(
  testator: Principal,
  heirs: Principal,
  identifier: nat32
): void {
  if (testatorMappingToWillIdentifier.isEmpty()) {
    testatorMappingToWillIdentifier.insert(testator, [identifier]);
  } else {
    const identifiers = testatorMappingToWillIdentifier.get(testator);
    match(identifiers, {
      Some: (identifiers) => {
        const updatedVec = [...identifiers, identifier];
        testatorMappingToWillIdentifier.insert(testator, updatedVec);
      },
      None: (none) => none,
    });
  }
  if (heirsMappingToWillIdentifier.isEmpty()) {
    heirsMappingToWillIdentifier.insert(heirs, [identifier]);
  } else {
    const identifiers = heirsMappingToWillIdentifier.get(heirs);
    match(identifiers, {
      Some: (identifiers) => {
        const updatedVec = [...identifiers, identifier];
        heirsMappingToWillIdentifier.insert(heirs, updatedVec);
      },
      None: (none) => none,
    });
  }
  return;
}

// remove will identifier from testators and heirs respectively
export function remove_identifier_from_mapping(
  testator: Principal,
  heirs: Principal,
  identifier: nat32
): void {
  const testatorIdentifiers = testatorMappingToWillIdentifier.get(testator);
  match(testatorIdentifiers, {
    Some: (identifiers) => {
      const index = identifiers.indexOf(identifier);
      identifiers.splice(index);
    },
    None: (none) => none,
  });

  const heirsIdentifiers = heirsMappingToWillIdentifier.get(heirs);
  match(heirsIdentifiers, {
    Some: (identifiers) => {
      const index = identifiers.indexOf(identifier);
      identifiers.splice(index);
    },
    None: (none) => none,
  });
  return;
}

//==============================================WILL CANISTER METHODS===============================================

//----------------------------------------------Query Methods--------------------------------------------------------

// Return Will Canister Id
$query;
export function get_will_canister_id(): Principal {
  return ic.id();
}

// This function is used to get all random identifiers create by users.
$query;
export function get_all_identifiers(): Vec<Tuple<[nat32, Principal]>> {
  return identifiersCache.items();
}

$query;
export function get_wills_for_testator(): GetTestatorWills {
  if (!is_user_exists(ic.caller())) {
    return {
      userNotExists: true,
    };
  }
  const testatorWillsIdentifiersOpt: Opt<Vec<nat32>> =
    testatorMappingToWillIdentifier.get(ic.caller());
  const testatorWillsIdentifiers = match(testatorWillsIdentifiersOpt, {
    Some: (identifiers) => identifiers,
    None: (none) => none,
  });
  if (testatorWillsIdentifiers == null) {
    return {
      noWillsExists: true,
    };
  } else {
    let testatorWills: Vec<Will> = [];

    for (const identifier of testatorWillsIdentifiers) {
      const willOpt: Opt<Will> = wills.get(identifier);

      const will = match(willOpt, {
        Some: (willObj) => willObj,
        None: (none) => none,
      });
      if (will == null) {
        continue;
      }
      testatorWills.push(will);
    }

    return {
      wills: testatorWills,
    };
  }
}

// Function used By Heirs To See All Available Wills To Claim
$query;
export function get_wills_for_heir(): GetHeirWills {
  const heirWillsIdentifiersOpt: Opt<Vec<nat32>> =
    heirsMappingToWillIdentifier.get(ic.caller());
  const heirWillsIdentifiers = match(heirWillsIdentifiersOpt, {
    Some: (identifiers) => identifiers,
    None: (none) => none,
  });
  if (heirWillsIdentifiers == null) {
    return {
      noWillsExists: true,
    };
  } else {
    let heirWills: Vec<Will> = [];

    for (const identifier of heirWillsIdentifiers) {
      const willOpt: Opt<Will> = wills.get(identifier);

      const will = match(willOpt, {
        Some: (willObj) => willObj,
        None: (none) => none,
      });

      if (will == null) {
        continue;
      }
      heirWills.push(will);
    }

    return {
      wills: heirWills,
    };
  }
}

$query;
export function get_all_wills(): Vec<Tuple<[nat32, Will]>> {
  return wills.items();
}
//----------------------------------------------Update Methods-------------------------------------------------------

// request random will identifier to create a unique will
$update;
export async function request_random_will_identifier(): Promise<nat32> {
  const MULTIPLY_BY_10s = 100_000_000;

  const randomWillIdentifier = Number(
    String(
      parseInt(
        String(
          Math.random() * MULTIPLY_BY_10s + Math.random() * MULTIPLY_BY_10s
        )
      )
    )
  );
  identifiersCache.insert(randomWillIdentifier, ic.caller());

  return randomWillIdentifier;
}

// root function for creating a will for supported assets type
$update;
export async function create_will(
  args: CreateWillArgs,
  willType: string
): Promise<CreateWill> {
  // check user existence
  const isUserExists = is_user_exists(ic.caller());

  if (!isUserExists) {
    return {
      userNotExists: true,
    };
  } else {
    switch (willType) {
      case "ICRC":
        //will for all ICRC suppported assets
        const icrcWill = await icrc_create_will(args.icrc);
        return {
          icrc: icrcWill,
        };
      case "BTC":
        // will for Bitcoin asset
        return {
          willTypeNotSupported: true,
        };
      default:
        // default always result in not supported type
        return {
          willTypeNotSupported: true,
        };
    }
  }
}

//Function to delete a Will By Testator
$update;
export async function delete_will(
  identifier: nat32,
  willType: string
): Promise<DeleteWill> {
  //check user existence
  if (!is_user_exists(ic.caller())) {
    return {
      userNotExists: true,
    };
  }

  // check the will_identifer exist
  if (!wills.containsKey(identifier)) {
    return {
      willNotExists: true,
    };
  }

  if (!isIdentifierUsed.containsKey(identifier)) {
    return {
      identifierUsed: true,
    };
  }

  const will = match(wills.get(identifier), {
    Some: (willObj) => willObj,
    None: (none) => none,
  });
  if (!will) {
    return {
      willNotExists: true,
    };
  } else {
    if (will.testator.toText() == ic.caller().toText()) {
      switch (willType) {
        case "ICRC":
          const icrcDeleteWill = await icrc_delete_will(identifier);
          return {
            icrc: icrcDeleteWill,
          };
        case "BTC":
          return {
            willTypeNotSupported: true,
          };
        default:
          return {
            willTypeNotSupported: true,
          };
      }
    } else {
      return {
        unAuthorized: true,
      };
    }
  }
}

// function to claim a will by heirs
// Note: This Function didn't check whether the claimer is registered with the platform or not
$update;
export async function claim_will(
  identifier: nat32,
  willType: string
): Promise<ClaimWill> {
  // check the identifier exists inside a Stable Memory
  if (!wills.containsKey(identifier)) {
    return {
      willNotExists: true,
    };
  }
  const will = match(wills.get(identifier), {
    Some: (will) => will,
    None: () => null,
  });

  if (!will) {
    return {
      willNotExists: true,
    };
  }

  // check whether the claimer princicpal is eligible to claim the funds with given identifier
  const heirs = will.heirs;
  const claimer = ic.caller();
  if (heirs.toText() != claimer.toText()) {
    return {
      unAuthorized: true,
    };
  }
  // call function based on will type
  switch (willType) {
    case "ICRC":
      const claimWill = await icrc_claim_will(will);
      return {
        icrc: claimWill,
      };
    case "BTC":
      return {
        willTypeNotSupported: true,
      };
    default:
      return {
        willTypeNotSupported: true,
      };
  }
}

//===================================================EXPORTS==================================================
export { get_user_details, add_user_details, update_user_details };

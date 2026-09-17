# Trumore Vehicle Passport Blockchain Layer

Hardhat 3 contracts for the Trumore Vehicle Passport PoC. The payment contract accepts Arc native USDC and records paid vehicle IDs, while `TrumoreVehiclePassport` anchors versioned report hashes. Native USDC uses 18 decimals on Arc, so the default passport price is `5e18`.

## Commands

```bash
npm install
npm run compile
npm test
npm run typecheck
npx hardhat run scripts/deploy.ts --network hardhatMainnet
npx hardhat run scripts/export-abi.ts --network hardhatMainnet
```

Ignition deployment follows the required order and configuration calls:

```bash
npx hardhat ignition deploy ignition/modules/Trumore.ts --network hardhatMainnet
npx hardhat ignition deploy ignition/modules/Trumore.ts --network arcTestnet
```

Set `ARC_TESTNET_RPC_URL`, `ARC_TESTNET_CHAIN_ID`, and `DEPLOYER_PRIVATE_KEY` for ARC. Set `TREASURY_ADDRESS` and `ATTESTER_ADDRESS` to configure those roles; local networks default both to the deployer. `PASSPORT_PRICE_USDC` is interpreted with 18 decimals and defaults to `5`. See `.env.example` for all deployment inputs.

For local tests, send exactly `5e18` native units with `purchasePassport(bytes32)`; no ERC20 approval or token contract is needed. The contract forwards each payment to the configured treasury using a reentrancy-protected native transfer and emits `address(0)` as the payment asset. `scripts/admin.ts` supports `pause`, `unpause`, `price`, `treasury`, and `attester` through environment variables. Never put private keys in frontend code or commit `.env` files.

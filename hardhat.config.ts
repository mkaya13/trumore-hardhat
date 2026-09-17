import "dotenv/config";
import hardhatToolboxMochaEthersPlugin from "@nomicfoundation/hardhat-toolbox-mocha-ethers";
import { defineConfig } from "hardhat/config";

const arcRpcUrl = process.env.ARC_TESTNET_RPC_URL;
const arcChainId = process.env.ARC_TESTNET_CHAIN_ID;

export default defineConfig({
  plugins: [hardhatToolboxMochaEthersPlugin],
  solidity: {
    profiles: {
      default: {
        version: "0.8.34",
      },
      production: {
        version: "0.8.34",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    },
  },
  networks: {
    hardhatMainnet: {
      type: "edr-simulated",
      chainType: "l1",
    },
    hardhatOp: {
      type: "edr-simulated",
      chainType: "op",
    },
    ...(arcRpcUrl && arcChainId
      ? {
          arcTestnet: {
            url: process.env.ARC_TESTNET_RPC_URL || "",
             chainId: Number(arcChainId),
            type: "http" as const,
            chainType: "l1" as const,
            accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [],
          },
        }
      : {}),
  },
});

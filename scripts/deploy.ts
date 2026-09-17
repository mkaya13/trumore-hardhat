import { network } from "hardhat";
import { id, parseUnits } from "ethers";

const { ethers, networkName } = await network.create();
const [deployer] = await ethers.getSigners();
const networkInfo = await ethers.provider.getNetwork();
const treasury = process.env.TREASURY_ADDRESS ?? deployer.address;
const attester = process.env.ATTESTER_ADDRESS ?? deployer.address;
const price = parseUnits(process.env.PASSPORT_PRICE_USDC ?? "5", 18);

const payment = await ethers.deployContract("TrumorePassportPayment", [price, treasury]);
await payment.waitForDeployment();
const passport = await ethers.deployContract("TrumoreVehiclePassport");
await passport.waitForDeployment();

const transactions: string[] = [];
for (const tx of [
  await passport.grantRole(id("ATTESTER_ROLE"), attester),
]) {
  transactions.push(tx.hash);
  await tx.wait();
}

console.log(JSON.stringify({
  network: networkName,
  chainId: networkInfo.chainId.toString(),
  passportPayment: await payment.getAddress(),
  vehiclePassport: await passport.getAddress(),
  passportPrice: price.toString(),
  treasury,
  attester,
  deploymentTransactionHashes: transactions,
}, null, 2));

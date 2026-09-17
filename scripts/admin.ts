import { network } from "hardhat";
import { id } from "ethers";

const { ethers } = await network.create();
const action = process.env.ADMIN_ACTION;
const paymentAddress = process.env.PASSPORT_PAYMENT_CONTRACT_ADDRESS;
const passportAddress = process.env.VEHICLE_PASSPORT_CONTRACT_ADDRESS;
if (!action) throw new Error("ADMIN_ACTION is required");
if (!paymentAddress && ["pause", "unpause", "price", "treasury"].includes(action)) throw new Error("PASSPORT_PAYMENT_CONTRACT_ADDRESS is required");

let tx;
if (action === "pause" || action === "unpause") {
  const payment = await ethers.getContractAt("TrumorePassportPayment", paymentAddress!);
  tx = await payment[action]();
} else if (action === "price") {
  const payment = await ethers.getContractAt("TrumorePassportPayment", paymentAddress!);
  tx = await payment.setPassportPrice(process.env.NEW_PRICE_RAW!);
} else if (action === "treasury") {
  const payment = await ethers.getContractAt("TrumorePassportPayment", paymentAddress!);
  tx = await payment.setTreasury(process.env.NEW_TREASURY!);
} else if (action === "attester") {
  if (!passportAddress) throw new Error("VEHICLE_PASSPORT_CONTRACT_ADDRESS is required");
  const passport = await ethers.getContractAt("TrumoreVehiclePassport", passportAddress);
  tx = await passport.grantRole(id("ATTESTER_ROLE"), process.env.NEW_ATTESTER!);
} else {
  throw new Error(`Unsupported ADMIN_ACTION: ${action}`);
}
await tx.wait();
console.log(`Admin action ${action} confirmed: ${tx.hash}`);

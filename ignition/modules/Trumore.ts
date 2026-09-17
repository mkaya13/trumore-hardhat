import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const price = BigInt((process.env.PASSPORT_PRICE_USDC ?? "5")) * 10n ** 18n;

export default buildModule("TrumoreModule", (m) => {
  const deployer = m.getAccount(0);
  const treasury = process.env.TREASURY_ADDRESS ?? deployer;
  const attester = process.env.ATTESTER_ADDRESS ?? deployer;
  const payment = m.contract("TrumorePassportPayment", [price, treasury]);
  const passport = m.contract("TrumoreVehiclePassport", [], { after: [payment] });

  m.call(passport, "grantRole", ["0xca77cd8f9856ef5fcd36f6b15bf469fe216c2f9114f60dd031f0a2b97b67aaa9", attester], { after: [passport] });
  return { payment, passport };
});

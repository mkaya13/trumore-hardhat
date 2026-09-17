import { expect } from "chai";
import { id, parseEther, ZeroHash } from "ethers";
import { network } from "hardhat";
import type { TrumorePassportPayment } from "../types/ethers-contracts/TrumorePassportPayment.js";
import type { TrumoreVehiclePassport } from "../types/ethers-contracts/TrumoreVehiclePassport.js";

const { ethers } = await network.create();
const PRICE = parseEther("5");
const VEHICLE_ID = id("NL1DEMO000000001");
const PASSPORT_HASH = id("passport-v1");

describe("Trumore blockchain layer", function () {
  async function deploy() {
    const [owner, buyer, treasury, other] = await ethers.getSigners();
    const payment = await ethers.deployContract("TrumorePassportPayment", [PRICE, treasury.address]) as unknown as TrumorePassportPayment;
    const passport = await ethers.deployContract("TrumoreVehiclePassport") as unknown as TrumoreVehiclePassport;
    return { owner, buyer, treasury, other, payment, passport };
  }

  it("takes the native price into the treasury and emits a native purchase record", async function () {
    const { payment, buyer, treasury } = await deploy();
    const treasuryBalanceBefore = await ethers.provider.getBalance(treasury.address);
    await expect(payment.connect(buyer).purchasePassport(VEHICLE_ID, { value: PRICE }))
      .to.emit(payment, "PassportPurchased")
      .withArgs(buyer.address, VEHICLE_ID, PRICE, ethers.ZeroAddress, (value: bigint) => value > 0n);
    expect(await ethers.provider.getBalance(treasury.address)).to.equal(treasuryBalanceBefore + PRICE);
  });

  it("requires the exact native price", async function () {
    const { payment, buyer } = await deploy();
    await expect(payment.connect(buyer).purchasePassport(VEHICLE_ID))
      .to.be.revertedWith("Payment: incorrect value");
    await expect(payment.connect(buyer).purchasePassport(VEHICLE_ID, { value: PRICE - 1n }))
      .to.be.revertedWith("Payment: incorrect value");
    await expect(payment.connect(buyer).purchasePassport(VEHICLE_ID, { value: PRICE + 1n }))
      .to.be.revertedWith("Payment: incorrect value");
  });

  it("enforces pause, zero addresses, and owner-only configuration", async function () {
    const { payment, buyer, other } = await deploy();
    await payment.pause();
    await expect(payment.connect(buyer).purchasePassport(VEHICLE_ID, { value: PRICE })).to.be.revertedWithCustomError(payment, "EnforcedPause");
    await payment.unpause();
    await expect(payment.connect(other).setPassportPrice(1n)).to.be.revertedWithCustomError(payment, "OwnableUnauthorizedAccount");
    await expect(payment.setTreasury(ethers.ZeroAddress)).to.be.revertedWith("Payment: zero treasury");
    await expect(payment.connect(buyer).purchasePassport(ZeroHash, { value: PRICE })).to.be.revertedWith("Payment: zero vehicle id");
  });

  it("attests, verifies, versions, and revokes passport hashes", async function () {
    const { passport, buyer, other } = await deploy();
    await expect(passport.attestPassport(VEHICLE_ID, PASSPORT_HASH, 1n))
      .to.emit(passport, "PassportAttested")
      .withArgs(VEHICLE_ID, PASSPORT_HASH, 1n, (value: bigint) => value > 0n);
    expect(await passport.verifyPassport(VEHICLE_ID, PASSPORT_HASH)).to.equal(true);
    expect(await passport.verifyPassport(VEHICLE_ID, id("wrong"))).to.equal(false);
    await expect(passport.connect(other).attestPassport(VEHICLE_ID, id("other"), 2n)).to.be.revertedWithCustomError(passport, "AccessControlUnauthorizedAccount");
    await expect(passport.attestPassport(VEHICLE_ID, id("older"), 1n)).to.be.revertedWith("Passport: version not newer");
    await expect(passport.revokePassport(VEHICLE_ID)).to.emit(passport, "PassportRevoked").withArgs(VEHICLE_ID, 1n);
    expect(await passport.verifyPassport(VEHICLE_ID, PASSPORT_HASH)).to.equal(false);
    await expect(passport.connect(buyer).revokePassport(VEHICLE_ID)).to.be.revertedWithCustomError(passport, "AccessControlUnauthorizedAccount");
  });

  it("runs the complete payment then attestation flow", async function () {
    const { payment, passport, buyer, treasury } = await deploy();
    const treasuryBalanceBefore = await ethers.provider.getBalance(treasury.address);
    await payment.connect(buyer).purchasePassport(VEHICLE_ID, { value: PRICE });
    expect(await ethers.provider.getBalance(treasury.address)).to.equal(treasuryBalanceBefore + PRICE);
    await passport.attestPassport(VEHICLE_ID, PASSPORT_HASH, 1n);
    expect(await passport.verifyPassport(VEHICLE_ID, PASSPORT_HASH)).to.equal(true);
  });
});

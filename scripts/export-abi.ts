import { mkdir, writeFile } from "node:fs/promises";
import { artifacts } from "hardhat";

const outputDirectory = "abi";
await mkdir(outputDirectory, { recursive: true });
for (const contractName of ["TrumorePassportPayment", "TrumoreVehiclePassport"]) {
  const artifact = await artifacts.readArtifact(contractName);
  await writeFile(`${outputDirectory}/${contractName}.json`, JSON.stringify({
    contractName,
    abi: artifact.abi,
    bytecode: artifact.bytecode,
  }, null, 2));
  console.log(`Exported ${outputDirectory}/${contractName}.json`);
}

import { ethers } from "hardhat";

async function main() {
  const [signer] = await ethers.getSigners();
  const ShinyToken = await ethers.getContractFactory("ShinyToken");
  const shinyToken = await ShinyToken.deploy("100000000000000000000", signer.address, signer.address);
  await shinyToken.deployed();
  console.log("Shiny Token deployed to:", shinyToken.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

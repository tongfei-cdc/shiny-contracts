import { ethers } from "hardhat";

async function main() {
  const ShinyProtocol = await ethers.getContractFactory("ShinyProtocol");
  const shinyTokenAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const shiny = await ShinyProtocol.deploy(shinyTokenAddress);
  await shiny.deployed();
  console.log("Shiny Protocol contract deployed to:", shiny.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

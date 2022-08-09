import { ethers } from "hardhat";

async function main() {
  const NFT = await ethers.getContractFactory("NFT");
  const nft = await NFT.deploy(
    "https://bafybeigvgivdy3mf6icdi46zqiwru5jjrb4r7e23ns7rtrsnnlfwg3vgve.ipfs.nftstorage.link/"
  );
  await nft.deployed();
  console.log("NFT contract deployed to:", nft.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

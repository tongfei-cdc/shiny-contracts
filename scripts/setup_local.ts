import { ethers } from "hardhat";

async function main() {
  const [owner, addr1, addr2] = await ethers.getSigners();

  const ShinyToken = await ethers.getContractFactory("ShinyToken");
  const shinyToken = await ShinyToken.deploy("100000000000000000000");
  await shinyToken.deployed();

  const NFT = await ethers.getContractFactory("NFT");
  const nft = await NFT.deploy(
    "https://bafybeigvgivdy3mf6icdi46zqiwru5jjrb4r7e23ns7rtrsnnlfwg3vgve.ipfs.nftstorage.link/"
  );
  await nft.deployed();

  await nft.mintNFT(owner.address);
  await nft.mintNFT(owner.address);
  await nft.mintNFT(addr1.address);
  await nft.mintNFT(addr1.address);
  await nft.mintNFT(addr2.address);
  await nft.mintNFT(addr2.address);

  const ShinyProtocol = await ethers.getContractFactory("ShinyProtocol");
  const shinyProtocol = await ShinyProtocol.deploy(shinyToken.address);
  await shinyProtocol.deployed();

  console.log("Shiny Token contract deployed to:", shinyToken.address);
  console.log("NFT contract deployed to:", nft.address);
  console.log("Shiny Protocol contract deployed to:", shinyProtocol.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

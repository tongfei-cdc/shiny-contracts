import { ethers } from "hardhat";

async function main() {
  const [owner, addr1, addr2] = await ethers.getSigners();

  console.log("deploying shiny token contract...");
  const ShinyToken = await ethers.getContractFactory("ShinyToken");
  const shinyToken = await ShinyToken.deploy("100000000000000000000");
  await shinyToken.deployed();

  console.log("deploying nft contract...");
  const NFT = await ethers.getContractFactory("NFT");
  const nft = await NFT.deploy(
    "https://bafybeigvgivdy3mf6icdi46zqiwru5jjrb4r7e23ns7rtrsnnlfwg3vgve.ipfs.nftstorage.link/"
  );
  await nft.deployed();

  console.log("minting nfts for owner and two other account");
  await (await nft.connect(owner).mintNFT(owner.address)).wait();
  await (await nft.connect(owner).mintNFT(owner.address)).wait();
  await (await nft.connect(owner).mintNFT(addr1.address)).wait();
  await (await nft.connect(owner).mintNFT(addr1.address)).wait();
  await (await nft.connect(owner).mintNFT(addr2.address)).wait();
  await (await nft.connect(owner).mintNFT(addr2.address)).wait();

  console.log("deploying shiny protocol contract...");
  const ShinyProtocol = await ethers.getContractFactory("ShinyProtocol");
  const shinyProtocol = await ShinyProtocol.deploy(shinyToken.address);
  await shinyProtocol.deployed();

  console.log("granting minter role of shiny token to shiny protocol...");
  const role = ethers.utils.solidityKeccak256(["string"], ["MINTER_ROLE"]);
  await shinyToken.grantRole(role, shinyProtocol.address);
  console.log("done.");

  console.log("Shiny Token contract deployed to:", shinyToken.address);
  console.log("NFT contract deployed to:", nft.address);
  console.log("Shiny Protocol contract deployed to:", shinyProtocol.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

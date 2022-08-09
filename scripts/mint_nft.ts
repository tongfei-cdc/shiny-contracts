import { ethers } from "hardhat";

async function main() {
  const [signer] = await ethers.getSigners();
  // testnet?
  // const address = "0x8656B29C14E659686c1615FC97c4bc0CF0949456";
  const address = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  const NFT = await ethers.getContractFactory("NFT");
  const nft = NFT.attach(address);

  await nft.mintNFT("0x70997970C51812dc3A010C7d01b50e0d17dc79C8");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

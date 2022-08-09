import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture, mine } from "@nomicfoundation/hardhat-network-helpers";

describe("ShinyProtocol", () => {
  async function deployFixture() {
    const [owner, addr1, addr2] = await ethers.getSigners();
    const ShinyToken = await ethers.getContractFactory("ShinyToken");
    const shinyToken = await ShinyToken.deploy(
      ethers.utils.parseEther("10000"),
      owner.address,
      owner.address
    );

    await shinyToken.deployed();

    const ShinyProtocol = await ethers.getContractFactory("ShinyProtocol");
    const shinyProtocol = await ShinyProtocol.deploy(shinyToken.address);

    const role = ethers.utils.solidityKeccak256(["string"], ["MINTER_ROLE"]);
    await shinyToken.grantRole(role, shinyProtocol.address);

    const NFT = await ethers.getContractFactory("NFT");
    const nft = await NFT.deploy("");

    await nft.deployed();

    await nft.connect(owner).mintNFT(addr1.address);
    await nft.connect(owner).mintNFT(addr1.address);

    await nft.connect(owner).mintNFT(addr2.address);
    await nft.connect(owner).mintNFT(addr2.address);

    return { shinyToken, shinyProtocol, nft };
  }

  describe("#stake", () => {
    it("works", async () => {
      const [owner, addr1, addr2] = await ethers.getSigners();
      const { shinyProtocol, nft } = await loadFixture(deployFixture);
      let shiny;
      await nft.connect(addr1).setApprovalForAll(shinyProtocol.address, true);
      await nft.connect(addr2).setApprovalForAll(shinyProtocol.address, true);
      shiny = shinyProtocol.connect(addr1);
      await shiny.stake(nft.address, 0);
      await shiny.stake(nft.address, 1);
      expect((await shiny.getStakedItems(addr1.address)).length).to.eq(2);
      shiny = shinyProtocol.connect(addr2);
      await shiny.stake(nft.address, 2);
      await shiny.stake(nft.address, 3);
      expect((await shiny.getStakedItems(addr2.address)).length).to.eq(2);
    });
  });

  describe("#claimRewards", () => {
    it("should receive unclaimed rewards", async () => {
      const [owner, addr1, addr2] = await ethers.getSigners();
      const { shinyProtocol, shinyToken, nft } = await loadFixture(
        deployFixture
      );

      await nft.connect(addr1).setApprovalForAll(shinyProtocol.address, true);
      await shinyProtocol.connect(addr1).stake(nft.address, 0);
      await mine(999);
      await shinyProtocol.connect(addr1).claimRewards();

      expect(await shinyToken.connect(addr1).balanceOf(addr1.address)).to.eq(
        ethers.utils.parseEther((1000 * 42).toString())
      );
      // expect(await shinyToken.connect(addr1).balanceOf(addr1.address)).to.eq(
      //   ethers.BigNumber.from(1000 * 42 * 10 ** 18)
      // );
    });
  });
});

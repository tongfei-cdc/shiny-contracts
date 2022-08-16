import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture, mine } from "@nomicfoundation/hardhat-network-helpers";

describe("ShinyProtocolV2", () => {
  async function deployFixture() {
    const [owner, addr1, addr2] = await ethers.getSigners();
    const ShinyToken = await ethers.getContractFactory("ShinyToken");
    const shinyToken = await ShinyToken.deploy(
      ethers.utils.parseEther("10000")
    );

    await shinyToken.deployed();

    // mint 100 shiny to addr1 and addr2
    shinyToken.mint(addr1.address, ethers.utils.parseEther("100"));
    shinyToken.mint(addr2.address, ethers.utils.parseEther("100"));

    const ShinyProtocol = await ethers.getContractFactory("ShinyProtocolV2");
    const shinyProtocol = await ShinyProtocol.deploy(shinyToken.address);

    await shinyToken
      .connect(addr1)
      .approve(shinyProtocol.address, ethers.utils.parseEther("100"));

    await shinyToken
      .connect(addr2)
      .approve(shinyProtocol.address, ethers.utils.parseEther("100"));

    const role = ethers.utils.solidityKeccak256(["string"], ["MINTER_ROLE"]);
    await shinyToken.grantRole(role, shinyProtocol.address);

    const NFT = await ethers.getContractFactory("NFT");
    const nft = await NFT.deploy("");

    await nft.deployed();

    await nft.connect(owner).mintNFT(addr1.address);
    await nft.connect(owner).mintNFT(addr1.address);

    await nft.connect(owner).mintNFT(addr2.address);
    await nft.connect(owner).mintNFT(addr2.address);

    await nft.connect(addr1).setApprovalForAll(shinyProtocol.address, true);
    await nft.connect(addr2).setApprovalForAll(shinyProtocol.address, true);

    return { shinyToken, shinyProtocol, nft };
  }

  describe("#stake", () => {
    describe("staking NFT if no shiny staked", () => {
      it("reverts", async () => {
        const [owner, addr1, addr2] = await ethers.getSigners();
        const { shinyProtocol, nft } = await loadFixture(deployFixture);

        await nft.connect(addr1).setApprovalForAll(shinyProtocol.address, true);
        await expect(
          shinyProtocol.connect(addr1).stakeNFT(nft.address, 0)
        ).to.be.revertedWith("You must supply shiny token before staking NFT");
      });
    });

    describe("staking NFT when shiny is staked", () => {
      it("works", async () => {
        const [owner, addr1, addr2] = await ethers.getSigners();
        const { shinyProtocol, nft, shinyToken } = await loadFixture(
          deployFixture
        );
        let shiny;
        await nft.connect(addr1).setApprovalForAll(shinyProtocol.address, true);
        await nft.connect(addr2).setApprovalForAll(shinyProtocol.address, true);
        shiny = shinyProtocol.connect(addr1);

        await shinyToken
          .connect(addr1)
          .approve(shiny.address, ethers.utils.parseEther("10"));
        await shiny.stakeShiny(ethers.utils.parseEther("10"));

        await shiny.stakeNFT(nft.address, 0);
        await shiny.stakeNFT(nft.address, 1);
        expect((await shiny.getStakedItems(addr1.address)).length).to.eq(2);
      });
    });
  });

  describe("#claimRewards", () => {
    it("should receive unclaimed rewards", async () => {
      const [owner, addr1, addr2] = await ethers.getSigners();
      const { shinyProtocol, shinyToken, nft } = await loadFixture(
        deployFixture
      );

      await shinyProtocol
        .connect(addr1)
        .stakeShiny(ethers.utils.parseEther("100"));
      await shinyProtocol
        .connect(addr2)
        .stakeShiny(ethers.utils.parseEther("50"));

      await shinyProtocol.connect(addr1).stakeNFT(nft.address, 0);
      await mine(999);
      await shinyProtocol.connect(addr1).claimRewards();

      expect(await shinyToken.connect(addr1).balanceOf(addr1.address)).to.eq(
        ethers.utils.parseEther(((100.0 / 150) * 42 * 1000).toString())
      );
    });
  });

  describe("#unstake", () => {
    describe("unstake all shiny when there are nft staked", () => {
      it("reverts", async () => {
        const [owner, addr1, addr2] = await ethers.getSigners();
        const { shinyProtocol, shinyToken, nft } = await loadFixture(
          deployFixture
        );

        await shinyProtocol
          .connect(addr1)
          .stakeShiny(ethers.utils.parseEther("100"));

        await shinyProtocol.connect(addr1).stakeNFT(nft.address, 0);

        await expect(
          shinyProtocol.unstakeShiny(ethers.utils.parseEther("100"))
        ).to.be.revertedWith("Unable to unstake");
      });
    });

    describe("unstake shiny", () => {
      it("works", async () => {
        const [owner, addr1, addr2] = await ethers.getSigners();
        const { shinyProtocol, shinyToken, nft } = await loadFixture(
          deployFixture
        );

        await shinyProtocol
          .connect(addr1)
          .stakeShiny(ethers.utils.parseEther("100"));

        await shinyProtocol.connect(addr1).stakeNFT(nft.address, 0);

        await shinyProtocol
          .connect(addr1)
          .unstakeShiny(ethers.utils.parseEther("90"));

        // expect(await shinyToken.connect(addr1).balanceOf(addr1.address)).to.eq(
        //   ethers.utils.parseEther("90")
        // );
      });
    });
  });

  describe("#changeEmissionRate", () => {
    it("should update emission rate", async () => {
      const [owner] = await ethers.getSigners();
      const { shinyProtocol } = await loadFixture(deployFixture);

      await shinyProtocol
        .connect(owner)
        .changeEmissionRate(ethers.utils.parseEther("1"));
      expect(await shinyProtocol.connect(owner).EMISSION_RATE()).to.eq(
        ethers.utils.parseEther("1")
      );
    });
  });
});

// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/security/ReentrancyGuard.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/utils/math/SafeMath.sol';
import "./ShinyToken.sol";
import "hardhat/console.sol";

contract ShinyProtocolV2 is ReentrancyGuard, Ownable, IERC721Receiver {
	using SafeMath for uint;

	uint public EMISSION_RATE = 42 * 10 ** 18;
	uint totalStakedNFTsCount = 0;
	uint totalStakedShinyAmount = 0;

	mapping(address => uint) userStakedShinyAmount;
	mapping(address => StakedItem[]) stakedItems;
	mapping(address => UserRewards) userRewards;

	ShinyToken shinyToken;

	struct StakedItem {
		uint tokenId;
		address nftContract;
		address owner;
	}

	struct UserRewards {
		uint lastClaimedBlockNum;
		uint unclaimedRewards;
	}

	constructor(address shinyAddress) {
		shinyToken = ShinyToken(shinyAddress);
	}

	function stakeShiny(uint _amount) public nonReentrant payable {
		userStakedShinyAmount[msg.sender] += _amount;
		totalStakedShinyAmount += _amount;

		IERC20(shinyToken).transferFrom(msg.sender, address(this), _amount);
	}

	function stakeNFT(address nftContract, uint tokenId) public nonReentrant {
		require(userStakedShinyAmount[msg.sender] > 0, "You must supply shiny token before staking NFT");

		StakedItem memory item = StakedItem(tokenId, nftContract, msg.sender);
		stakedItems[msg.sender].push(item);

		totalStakedNFTsCount += 1;
		userRewards[msg.sender] = UserRewards(block.number, 0);

		IERC721(nftContract).safeTransferFrom(msg.sender, address(this), tokenId);
	}

	function claimRewards() public nonReentrant {
		_claimRewards(msg.sender);
	}

	function changeEmissionRate(uint newEmissionRate) public onlyOwner {
		EMISSION_RATE = newEmissionRate;
	}

	function unstakeNFT(address nftContract, uint tokenId) public nonReentrant {
		_claimRewards(msg.sender);

		StakedItem[] storage items = stakedItems[msg.sender];

		for (uint i = 0; i < items.length; i++) {
			if (items[i].tokenId == tokenId && items[i].nftContract == nftContract) {
				items[i] = items[items.length - 1];
				items.pop();
				break;
			}
		}

		IERC721(nftContract).safeTransferFrom(address(this), msg.sender, tokenId);
	}

	function unstakeShiny(uint _amount) public nonReentrant {
		require(_amount <= userStakedShinyAmount[msg.sender], "Unable to unstake");

		if (_amount == userStakedShinyAmount[msg.sender] && stakedItems[msg.sender].length != 0) {
			revert("Make sure to unstake all your NFTs before unstake all token");
		}

		userStakedShinyAmount[msg.sender] -= _amount;
		totalStakedShinyAmount -= _amount;

		IERC20(shinyToken).approve(address(this), _amount);
		IERC20(shinyToken).transferFrom(address(this), msg.sender, _amount);
	}

	function getUserStakedShinyAmount(address _addr) public view returns (uint) {
		return userStakedShinyAmount[_addr];
	}

	function _claimRewards(address _addr) private returns (uint) {
		uint rewards = (stakedItems[_addr].length)
			.mul(userStakedShinyAmount[msg.sender])
			.mul(EMISSION_RATE)
			.mul(block.number - userRewards[msg.sender].lastClaimedBlockNum)
			.div(totalStakedNFTsCount.mul(totalStakedShinyAmount));

		if (rewards > 0) {
			shinyToken.mint(_addr, rewards);
		}

		userRewards[msg.sender].lastClaimedBlockNum = block.number;

		return rewards;
	}

	function getStakedItems(address account) public view returns (StakedItem[] memory) {
		return stakedItems[account];
	}

	function onERC721Received(address, address, uint256, bytes memory) public virtual override returns (bytes4) {
		return this.onERC721Received.selector;
	}
}
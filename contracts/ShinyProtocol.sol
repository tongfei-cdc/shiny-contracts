// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/security/ReentrancyGuard.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import "./ShinyToken.sol";

contract ShinyProtocol is ReentrancyGuard, Ownable, IERC721Receiver {
	struct StakedItem {
		uint tokenId;
		address nftContract;
		address owner;
		uint lastClaimedBlockNum;
		uint unclaimedRewards;
	}

	ShinyToken shinyToken;

	mapping(address => StakedItem[]) stakedItems;

	constructor(address shinyAddress) {
		shinyToken = ShinyToken(shinyAddress);
	}

	function stake(address nftContract, uint tokenId) public nonReentrant {
		StakedItem memory item = StakedItem(tokenId, nftContract, msg.sender, block.number, 0);
		stakedItems[msg.sender].push(item);

		IERC721(nftContract).safeTransferFrom(msg.sender, address(this), tokenId);
	}

	function getStakedItems(address account) public view returns (StakedItem[] memory) {
		return stakedItems[account];
	}

	function claimRewards() public {
		_claimRewards(msg.sender);
	}

	function unstake(address nftContract, uint tokenId) public nonReentrant {
		// _claimRewards(msg.sender);
	}

	function _claimRewards(address _addr) internal nonReentrant returns (uint) {
		StakedItem[] storage items = stakedItems[_addr];
		uint rewards = 0;

		for(uint i = 0; i < items.length; i++) {
			StakedItem storage item = items[i];

			uint elapsedTime = (block.number - item.lastClaimedBlockNum);
			item.unclaimedRewards = elapsedTime * 42 * 10 ** 18;
			rewards += item.unclaimedRewards;
			item.lastClaimedBlockNum = block.number;
			item.unclaimedRewards = 0;
		}

		shinyToken.mint(_addr, rewards);

		return rewards;
	}

	function onERC721Received(address, address, uint256, bytes memory) public virtual override returns (bytes4) {
		return this.onERC721Received.selector;
	}
}
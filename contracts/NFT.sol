// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import '@openzeppelin/contracts/access/Ownable.sol';

contract NFT is ERC721Enumerable, Ownable {
	using Counters for Counters.Counter;
	Counters.Counter private _tokenIds;

	string public baseTokenURI;

	constructor(string memory _baseTokenURI) ERC721("Pets", "PET") {
		baseTokenURI = _baseTokenURI;
	}

	function mintNFT(address _addr) public onlyOwner returns (uint256) {
		uint256 newTokenId = _tokenIds.current();
		_mint(_addr, newTokenId);

		_tokenIds.increment();
		return newTokenId;
	}	

	function _baseURI() internal view virtual override returns (string memory) {
		return baseTokenURI;
	}

	function setBaseURI(string memory _baseTokenURI) public onlyOwner {
		baseTokenURI = _baseTokenURI;
	}
}
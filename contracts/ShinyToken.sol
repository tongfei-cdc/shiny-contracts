// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ShinyToken {
    constructor(uint256 initialSupply) ERC20("Shiny", "SNY") {
        _mint(msg.sender, initialSupply);
    }
}

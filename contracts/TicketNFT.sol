// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TicketNFT is ERC721, Ownable {
    uint256 public tokenCounter;

    constructor() ERC721("EventTicket", "ETK") {
        tokenCounter = 0;
    }

    function mintTicket(address to) public onlyOwner {
        _safeMint(to, tokenCounter);
        tokenCounter++;
    }
}

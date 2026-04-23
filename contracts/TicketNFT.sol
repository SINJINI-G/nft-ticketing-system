// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TicketNFT is ERC721, Ownable {

    uint256 public eventCounter;
    uint256 public tokenCounter;

    struct Event {
        string name;
        string date;
        uint256 price;
        uint256 totalTickets;
        uint256 ticketsSold;
        string image;
    }

    struct Ticket {
        uint256 eventId;
    }

    mapping(uint256 => Event) public events;
    mapping(uint256 => Ticket) public tickets;
    mapping(address => uint256[]) public userTickets;
    mapping(uint256 => bool) public ticketScanned;

    function checkIn(uint256 _tokenId) public {
        // Only the organiser should ideally call this, but for now:
        require(!ticketScanned[_tokenId], "Already scanned");
        ticketScanned[_tokenId] = true;
    }

    function getUserTickets(address user) public view returns (uint256[] memory) {
        return userTickets[user];
    }
    constructor() ERC721("EventTicket", "ETK") {}


    // ✅ CREATE EVENT (ORGANISER)
    function createEvent(
        string memory _name,
        string memory _date,
        uint256 _price,
        uint256 _totalTickets,
        string memory _image
    ) public {
        events[eventCounter] = Event(
            _name,
            _date,
            _price,
            _totalTickets,
            0,
            _image
        );

        eventCounter++;
    }

    // ✅ BUY TICKET
    function buyTicket(uint256 eventId) public payable {
        Event storage e = events[eventId];
        require(events[eventId].ticketsSold < events[eventId].totalTickets, "Sold Out");
        require(msg.value >= e.price, "Not enough ETH");

        uint256 tokenId = tokenCounter;

        _safeMint(msg.sender, tokenId);

        tickets[tokenId] = Ticket(eventId);

        userTickets[msg.sender].push(tokenId);
        e.ticketsSold++;
        tokenCounter++;
    }

    // ✅ GET EVENT
    function getEvent(uint256 eventId) public view returns (Event memory) {
        return events[eventId];
    }

    // ✅ GET TICKET EVENT
    function getTicketEvent(uint256 tokenId) public view returns (uint256) {
        return tickets[tokenId].eventId;
    }
}
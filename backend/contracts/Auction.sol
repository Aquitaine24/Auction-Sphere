// contracts/Auction.sol

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Auction {
    address payable public seller;
    uint public auctionEndTime;

    address public highestBidder;
    uint public highestBid;

    mapping(address => uint) public pendingReturns;

    bool public ended;

    string public itemName;
    string public itemDescription;

    event HighestBidIncreased(address bidder, uint amount);
    event AuctionEnded(address winner, uint amount);

    constructor(
        uint _biddingTime,
        address payable _seller,
        string memory _itemName,
        string memory _itemDescription
    ) {
        seller = _seller;
        auctionEndTime = block.timestamp + _biddingTime;
        itemName = _itemName;
        itemDescription = _itemDescription;
    }

    function bid() public payable {
        require(block.timestamp <= auctionEndTime, "Auction already ended.");
        require(msg.value > highestBid, "There already is a higher bid.");

        if (highestBid != 0) {
            pendingReturns[highestBidder] += highestBid;
        }
        highestBidder = msg.sender;
        highestBid = msg.value;
        emit HighestBidIncreased(msg.sender, msg.value);
    }

    function withdraw() public returns (bool) {
        uint amount = pendingReturns[msg.sender];
        if (amount > 0) {
            pendingReturns[msg.sender] = 0;

            if (!payable(msg.sender).send(amount)) {
                pendingReturns[msg.sender] = amount;
                return false;
            }
        }
        return true;
    }

    function auctionEnd() public {
        require(!ended, "auctionEnd has already been called.");
        require(block.timestamp >= auctionEndTime, "Auction not yet ended.");

        ended = true;
        emit AuctionEnded(highestBidder, highestBid);

        seller.transfer(highestBid);
    }
}

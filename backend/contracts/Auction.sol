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
    string public itemImageURL;

    event HighestBidIncreased(address indexed bidder, uint amount);
    event AuctionEnded(address indexed winner, uint amount);
    event TransferFailed(address indexed seller, uint amount);
    event AuctionEndCalled(address caller, uint timestamp);
    event TransferAttempt(address recipient, uint amount, bool success);
    event BalanceLog(uint balanceBefore, uint balanceAfter);

    constructor(
        uint _biddingTime,
        address payable _seller,
        string memory _itemName,
        string memory _itemDescription,
        string memory _itemImageURL
    ) {
        seller = _seller;
        auctionEndTime = block.timestamp + _biddingTime;
        itemName = _itemName;
        itemDescription = _itemDescription;
        itemImageURL = _itemImageURL;
    }

    function bid() public payable {
        require(block.timestamp <= auctionEndTime, "Auction already ended.");
        require(msg.value > highestBid, "There already is a higher bid.");

        // Refund the previous highest bidder
        if (highestBid != 0) {
            pendingReturns[highestBidder] += highestBid;
        }

        highestBidder = msg.sender;
        highestBid = msg.value;
        emit HighestBidIncreased(msg.sender, msg.value);
    }

    function withdraw() public returns (bool) {
        uint amount = pendingReturns[msg.sender];
        require(amount > 0, "No funds to withdraw.");

        // Set pending return to zero to prevent re-entrancy attacks
        pendingReturns[msg.sender] = 0;

        (bool success, ) = msg.sender.call{value: amount}("");
        if (!success) {
            // Reset pending return if transfer failed
            pendingReturns[msg.sender] = amount;
            return false;
        }

        return true;
    }
    modifier onlySeller() {
        require(msg.sender == seller, "Only the seller can end the auction.");
        _;
    }
    function auctionEnd() public {
        require(block.timestamp >= auctionEndTime, "Auction not yet ended.");
        require(!ended, "auctionEnd has already been called.");

        ended = true;
        emit AuctionEnded(highestBidder, highestBid);
        emit AuctionEndCalled(msg.sender, block.timestamp);

        uint balanceBefore = address(this).balance;

        // Transfer the highest bid to the seller
        (bool success, ) = seller.call{value: highestBid}("");
        require(success, "Transfer to seller failed.");

        // Optional: Add a logging mechanism for debugging
        if (!success) {
            emit TransferFailed(seller, highestBid);
        }

        uint balanceAfter = address(this).balance;
        emit BalanceLog(balanceBefore, balanceAfter);
    }
}

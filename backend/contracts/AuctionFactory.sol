// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Auction.sol";

contract AuctionFactory {
    Auction[] public auctions;

    event AuctionCreated(address auctionAddress, address seller);

    function createAuction(
        uint _biddingTime,
        string memory _itemName,
        string memory _itemDescription,
        string memory _itemImageURL // Added image URL parameter
    ) public {
        Auction newAuction = new Auction(
            _biddingTime,
            payable(msg.sender),
            _itemName,
            _itemDescription,
            _itemImageURL // Pass the image URL to the Auction constructor
        );
        auctions.push(newAuction);
        emit AuctionCreated(address(newAuction), msg.sender);
    }

    function getAuctions() public view returns (Auction[] memory) {
        return auctions;
    }
}

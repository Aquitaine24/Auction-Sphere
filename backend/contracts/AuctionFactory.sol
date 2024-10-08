// contracts/AuctionFactory.sol

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Auction.sol";

contract AuctionFactory {
    Auction[] public auctions;

    event AuctionCreated(address auctionAddress, address seller);

    function createAuction(
        uint _biddingTime,
        string memory _itemName,
        string memory _itemDescription
    ) public {
        Auction newAuction = new Auction(
            _biddingTime,
            payable(msg.sender),
            _itemName,
            _itemDescription
        );
        auctions.push(newAuction);
        emit AuctionCreated(address(newAuction), msg.sender);
    }

    function getAuctions() public view returns (Auction[] memory) {
        return auctions;
    }
}

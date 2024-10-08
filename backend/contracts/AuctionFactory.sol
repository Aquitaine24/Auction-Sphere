// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Auction.sol";

contract AuctionFactory {
    address[] public auctions;
    event AuctionCreated(address auctionAddress, address seller);

    function createAuction(
        uint _biddingTime,
        string memory _itemName,
        string memory _itemDescription,
        string memory _itemImageURL
    ) public {
        Auction newAuction = new Auction(
            _biddingTime,
            payable(msg.sender),
            _itemName,
            _itemDescription,
            _itemImageURL
        );
        auctions.push(address(newAuction));
        emit AuctionCreated(address(newAuction), msg.sender);
    }

    function getAuctions() public view returns (address[] memory) {
        return auctions;
    }
}

const { expect } = require("chai");

describe("Auction Contract", function () {
  let Auction;
  let auction;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    Auction = await ethers.getContractFactory("Auction");
    [owner, addr1, addr2] = await ethers.getSigners();

    auction = await Auction.deploy(
      300, // Bidding time in seconds (5 minutes)
      owner.address, // Seller address
      "Test Item", // Item name
      "This is a test item." // Item description
    );
    await auction.deployed();
  });

  it("Should set the right seller", async function () {
    expect(await auction.seller()).to.equal(owner.address);
  });

  it("Should accept bids and update highest bidder", async function () {
    await auction.connect(addr1).bid({ value: ethers.utils.parseEther("1") });
    expect(await auction.highestBidder()).to.equal(addr1.address);
    expect(await auction.highestBid()).to.equal(
      ethers.utils.parseEther("1")
    );

    await auction.connect(addr2).bid({ value: ethers.utils.parseEther("2") });
    expect(await auction.highestBidder()).to.equal(addr2.address);
    expect(await auction.highestBid()).to.equal(
      ethers.utils.parseEther("2")
    );
  });

  it("Should not accept bids lower than highest bid", async function () {
    await auction.connect(addr1).bid({ value: ethers.utils.parseEther("1") });
    await expect(
      auction.connect(addr2).bid({ value: ethers.utils.parseEther("0.5") })
    ).to.be.revertedWith("There already is a higher bid.");
  });

  it("Should allow withdrawal of overbid amounts", async function () {
    await auction.connect(addr1).bid({ value: ethers.utils.parseEther("1") });
    await auction.connect(addr2).bid({ value: ethers.utils.parseEther("2") });

    // addr1 should be able to withdraw their overbid amount
    const initialBalance = await ethers.provider.getBalance(addr1.address);
    const tx = await auction.connect(addr1).withdraw();
    const receipt = await tx.wait();
    const gasUsed = receipt.gasUsed.mul(receipt.effectiveGasPrice);
    const finalBalance = await ethers.provider.getBalance(addr1.address);

    expect(finalBalance).to.equal(
      initialBalance.add(ethers.utils.parseEther("1")).sub(gasUsed)
    );
  });

  it("Should not allow auction end before time", async function () {
    await expect(auction.auctionEnd()).to.be.revertedWith(
      "Auction not yet ended."
    );
  });

  it("Should allow seller to end auction after time", async function () {
    // Increase time
    await ethers.provider.send("evm_increaseTime", [400]);
    await ethers.provider.send("evm_mine", []);

    await auction.auctionEnd();
    expect(await auction.ended()).to.equal(true);
  });
});

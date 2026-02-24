import { describe, it, expect } from "@jest/globals";
import { evaluateAuctionBidAccess } from "../utils/auctionAccess.js";

describe("auction access policy", () => {
  it("allows approved bidder capability", () => {
    const result = evaluateAuctionBidAccess({
      role: "individual",
      auctionCapabilities: {
        auctionBidder: { status: "approved" },
      },
    });
    expect(result.allowed).toBe(true);
  });

  it("allows verified legacy dealer compatibility", () => {
    const result = evaluateAuctionBidAccess({
      role: "dealer",
      dealerInfo: { verified: true },
      auctionCapabilities: {
        auctionBidder: { status: "not_requested" },
        auctionDealer: { status: "not_requested" },
      },
    });
    expect(result.allowed).toBe(true);
  });
});


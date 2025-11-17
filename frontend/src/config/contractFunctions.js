export const CONTRACT_FUNCTIONS = {
    NFT: {
        GET_ALL_NFTS_OF_USER: "getUserNFTs",
        MINT: "mint",
        IS_APPROVED_FOR_ALL: "isApprovedForAll",
        SET_APPROVAL_FOR_ALL: "setApprovalForAll",
        URI: "uri",
        BALANCE_OF: "balanceOf",
    },
    MARKETPLACE: {
        GET_LISTING_PRICE: "listingPrice",
        CREATE_ITEM: "createMarketItem",
        BUY: "buy",
        FETCH_MARKET_ITEMS: "fetchMarketItems",
        FETCH_MY_NFTS: "fetchMyNfts",
        UNLIST_ITEM: "unlistItem",
    },
};
export default CONTRACT_FUNCTIONS;

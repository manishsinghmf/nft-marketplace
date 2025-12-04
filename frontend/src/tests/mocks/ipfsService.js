export const IpfsService = {
    uploadFile: vi.fn().mockResolvedValue("fake_ipfs_image_hash"),
    uploadNFTMetadata: vi.fn().mockResolvedValue("fake_ipfs_metadata_hash"),
};

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@scroll-tech/contracts/ZkOptimized.sol";

contract FitNFT is ERC721URIStorage, Ownable, ZkOptimized {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    struct ActivityData {
        uint256 distance
        uint256 duration; 
        string geoHash;
    }
    
    mapping(uint256 => ActivityData) public activityData;
    
    constructor() ERC721("FitActivityNFT", "FIT") {}
    
    function mintNFT(
        address recipient,
        string memory tokenURI,
        uint256 distance,
        uint256 duration,
        string memory geoHash,
        bytes32 zkProof
    ) external onlyVerified(zkProof) returns (uint256) {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        
        _mint(recipient, newItemId);
        _setTokenURI(newItemId, tokenURI);
        
        activityData[newItemId] = ActivityData({
            distance: distance,
            duration: duration,
            geoHash: geoHash
        });
        
        return newItemId;
    }

    function bulkMint(
        address[] memory recipients,
        string[] memory uris,
        uint256[] memory distances,
        uint256[] memory durations,
        string[] memory geoHashes,
        bytes32 zkProof
    ) external onlyVerified(zkProof) {
        require(recipients.length == uris.length, "Arrays mismatch");
        
        for(uint i = 0; i < recipients.length; i++) {
            mintNFT(recipients[i], uris[i], distances[i], durations[i], geoHashes[i], zkProof);
        }
    }
}
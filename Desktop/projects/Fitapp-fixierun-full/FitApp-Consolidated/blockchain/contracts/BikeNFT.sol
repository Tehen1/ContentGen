// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract BikeNFT is ERC721URIStorage {
    mapping(uint256 => bytes) public nftDNA;

    constructor() ERC721("BikeNFT", "BNFT") {}

    function evolveNFT(uint256 tokenId, bytes calldata geneticData) external {
        _validateDNA(geneticData);
        nftDNA[tokenId] = geneticData;
        _setTokenURI(tokenId, _generateNewMetadata(geneticData));
    }

    function _validateDNA(bytes calldata geneticData) internal pure {
        require(geneticData.length == 32, "Invalid DNA length");
    }

    function _generateNewMetadata(bytes memory geneticData) internal pure returns (string memory) {
        // TO DO: Implement metadata generation logic
        return "ipfs://example-metadata-uri";
    }
}

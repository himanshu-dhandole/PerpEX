// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract PositionNFT is ERC721, Ownable, ReentrancyGuard {
    // Struct to hold position details
    struct PositionMetadata {
        uint256 tokenId;
        uint8 leverage;
        uint256 collateral;
        uint256 entryPrice;
        int256 entryFundingRate;
        uint256 entryTimestamp;
        bool isLong;
        bool isOpen;
        string symbol;
    }

    // Mapping from token ID to position data
    mapping(uint256 => PositionMetadata) public positionMetadata;

    // Mapping from user address to owned token IDs
    mapping(address => uint256[]) private _userTokens;

    // Position manager contract address
    address public positionManager;

    // Base URI for metadata
    string private _baseTokenURI;

    // Token ID counter
    uint256 private _tokenIdCounter;

    // Events
    event PositionMinted(uint256 indexed tokenId, address indexed user, uint256 leverage, uint256 collateral, bool isLong);
    event PositionBurned(uint256 indexed tokenId);
    event PositionUpdated(uint256 indexed tokenId, uint8 leverage, uint256 collateral);

    // Restrict to position manager
    modifier onlyPositionManager() {
        require(msg.sender == positionManager, "Only PositionManager");
        _;
    }

    // Constructor sets base URI and initializes token ID counter
    constructor(string memory baseURI) ERC721("Perpetual Position", "PERP-POS") Ownable(msg.sender) {
        _baseTokenURI = baseURI;
        _tokenIdCounter = 1;
    }

    // Set the address of the position manager
    function setPositionManager(address _positionManager) external onlyOwner {
        require(_positionManager != address(0), "Invalid address");
        positionManager = _positionManager;
    }

    // Mint a new position NFT
    function mintPosition(
        address to, 
        uint256 collateral, 
        uint8 leverage, 
        uint256 entryPrice, 
        int256 entryFundingRate, 
        bool isLong
    ) external onlyPositionManager nonReentrant returns (uint256) {
        require(to != address(0), "Invalid user address");
        require(leverage > 0 && leverage <= 50, "Invalid leverage range");
        require(collateral > 0, "Collateral must be > 0");
        require(entryPrice > 0, "Entry price must be > 0");

        uint256 tokenId = _tokenIdCounter++;
        _safeMint(to, tokenId);

        positionMetadata[tokenId] = PositionMetadata({
            tokenId: tokenId,
            leverage: leverage,
            collateral: collateral,
            entryPrice: entryPrice,
            entryFundingRate: entryFundingRate,
            entryTimestamp: block.timestamp,
            isLong: isLong,
            isOpen: true,
            symbol: isLong ? "vETH-LONG" : "vETH-SHORT"
        });

        _userTokens[to].push(tokenId);

        emit PositionMinted(tokenId, to, leverage, collateral, isLong);
        return tokenId;
    }

    // Burn a position NFT
    function burnPosition(uint256 tokenId) external onlyPositionManager nonReentrant {
        address owner = _ownerOf(tokenId);
        require(owner != address(0), "Position does not exist");

        delete positionMetadata[tokenId];
        _burn(tokenId);

        // Remove token from user's list - fixed array management
        uint256[] storage tokens = _userTokens[owner];
        for (uint256 i = 0; i < tokens.length; i++) {
            if (tokens[i] == tokenId) {
                // Move last element to current position and remove last element
                tokens[i] = tokens[tokens.length - 1];
                tokens.pop();
                break;
            }
        }

        emit PositionBurned(tokenId);
    }

    // Update size and collateral of an existing position
    function updatePosition(uint256 tokenId, uint8 newLeverage, uint256 newCollateral) external onlyPositionManager {
        require(_ownerOf(tokenId) != address(0), "Position does not exist");
        require(newLeverage > 0 && newLeverage <= 50, "Invalid leverage range");
        require(newCollateral > 0, "Collateral must be > 0");

        PositionMetadata storage pos = positionMetadata[tokenId];
        pos.leverage = newLeverage;
        pos.collateral = newCollateral;

        emit PositionUpdated(tokenId, newLeverage, newCollateral);
    }

    // Close a position (mark as closed without burning)
    function closePosition(uint256 tokenId) external onlyPositionManager {
        require(_ownerOf(tokenId) != address(0), "Position does not exist");
        
        PositionMetadata storage pos = positionMetadata[tokenId];
        require(pos.isOpen, "Position already closed");
        pos.isOpen = false;
    }

    // View details of a specific position
    function getPosition(uint256 tokenId) external view returns (
        uint256, 
        uint256, 
        uint8, 
        uint256, 
        uint256, 
        int256, 
        bool, 
        bool, 
        string memory
    ) {
        require(_ownerOf(tokenId) != address(0), "Position does not exist");
        PositionMetadata memory pos = positionMetadata[tokenId];
        return (
            pos.tokenId, 
            pos.collateral, 
            pos.leverage, 
            pos.entryPrice, 
            pos.entryTimestamp, 
            pos.entryFundingRate, 
            pos.isLong, 
            pos.isOpen, 
            pos.symbol
        );
    }

    // Get list of position token IDs owned by a user
    function getUserPositions(address user) external view returns (uint256[] memory) {
        return _userTokens[user];
    }

    // Get list of open position token IDs owned by a user
    function getUserOpenPositions(address user) external view returns (uint256[] memory) {
        uint256[] memory userTokens = _userTokens[user];
        uint256 openCount = 0;
        
        // Count open positions
        for (uint256 i = 0; i < userTokens.length; i++) {
            if (positionMetadata[userTokens[i]].isOpen) {
                openCount++;
            }
        }
        
        // Create array of open positions
        uint256[] memory openPositions = new uint256[](openCount);
        uint256 index = 0;
        for (uint256 i = 0; i < userTokens.length; i++) {
            if (positionMetadata[userTokens[i]].isOpen) {
                openPositions[index] = userTokens[i];
                index++;
            }
        }
        
        return openPositions;
    }

    // Check if a position exists and is open
    function isPositionOpen(uint256 tokenId) external view returns (bool) {
        if (_ownerOf(tokenId) == address(0)) {
            return false;
        }
        return positionMetadata[tokenId].isOpen;
    }

    // Set base URI for token metadata
    function setBaseURI(string memory baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
    }

    // Return base URI (used by tokenURI)
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    // Return full token URI
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Position does not exist");
        return string(abi.encodePacked(_baseURI(), Strings.toString(tokenId), ".json"));
    }

    // Prevent transfers; only mint and burn allowed
    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = _ownerOf(tokenId);
        require(from == address(0) || to == address(0), "Positions are non-transferable");
        return super._update(to, tokenId, auth);
    }
}
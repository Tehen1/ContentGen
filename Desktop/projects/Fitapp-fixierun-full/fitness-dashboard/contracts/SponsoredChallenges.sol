// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@scroll-tech/contracts/ZkOptimized.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract SponsoredChallenges is ERC721URIStorage, AccessControl, ZkOptimized {
    using Counters for Counters.Counter;
    Counters.Counter private _challengeIds;

    struct Challenge {
        address sponsor;
        uint256 rewardPool;
        uint256 participantLimit;
        string metadataURI;
        bool isActive;
        uint256 startTime;
        uint256 endTime;
    }

    mapping(uint256 => Challenge) public challenges;
    mapping(uint256 => mapping(address => bool)) public participants;
    mapping(uint256 => address[]) public winners;

    bytes32 public constant SPONSOR_ROLE = keccak256("SPONSOR_ROLE");

    event ChallengeCreated(uint256 indexed challengeId, address sponsor);
    event ParticipantJoined(uint256 indexed challengeId, address user);
    event RewardClaimed(address indexed user, uint256 amount);

    constructor() ERC721("SponsoredChallenge", "SPONFT") {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function createChallenge(
        uint256 reward,
        uint256 limit,
        string memory uri,
        uint256 duration,
        bytes32 zkProof
    ) external payable onlyRole(SPONSOR_ROLE) onlyVerified(zkProof) returns (uint256) {
        require(msg.value == reward, "Incorrect amount");
        
        _challengeIds.increment();
        uint256 newChallengeId = _challengeIds.current();

        challenges[newChallengeId] = Challenge({
            sponsor: msg.sender,
            rewardPool: reward,
            participantLimit: limit,
            metadataURI: uri,
            isActive: true,
            startTime: block.timestamp,
            endTime: block.timestamp + duration
        });

        _mint(address(this), newChallengeId);
        _setTokenURI(newChallengeId, uri);

        emit ChallengeCreated(newChallengeId, msg.sender);
        return newChallengeId;
    }

    function joinChallenge(uint256 challengeId, bytes32 zkProof) external onlyVerified(zkProof) {
        Challenge storage c = challenges[challengeId];
        
        require(c.isActive, "Challenge inactive");
        require(block.timestamp < c.endTime, "Challenge ended");
        require(!participants[challengeId][msg.sender], "Already joined");
        require(
            getParticipantCount(challengeId) < c.participantLimit,
            "Participant limit reached"
        );

        participants[challengeId][msg.sender] = true;
        emit ParticipantJoined(challengeId, msg.sender);
    }

    function declareWinners(
        uint256 challengeId,
        address[] calldata winnersList,
        uint256[] calldata amounts,
        bytes32 zkProof
    ) external onlyRole(SPONSOR_ROLE) onlyVerified(zkProof) {
        require(winnersList.length == amounts.length, "Invalid input");
        
        Challenge storage c = challenges[challengeId];
        require(c.sponsor == msg.sender, "Not sponsor");
        require(block.timestamp >= c.endTime, "Challenge ongoing");

        uint256 total;
        for (uint i = 0; i < amounts.length; i++) {
            total += amounts[i];
            require(participants[challengeId][winnersList[i]], "Not participant");
            payable(winnersList[i]).transfer(amounts[i]);
            winners[challengeId].push(winnersList[i]);
            emit RewardClaimed(winnersList[i], amounts[i]);
        }

        require(total <= c.rewardPool, "Exceeds reward pool");
        c.rewardPool -= total;
        c.isActive = false;
    }

    function getParticipantCount(uint256 challengeId) public view returns (uint256) {
        return winners[challengeId].length;
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
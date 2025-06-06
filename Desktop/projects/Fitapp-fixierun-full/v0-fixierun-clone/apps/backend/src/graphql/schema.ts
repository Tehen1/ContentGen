import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  scalar Date

  enum BikeRarity {
    COMMON
    RARE
    EPIC
    LEGENDARY
    MYTHIC
  }

  enum RewardType {
    DISTANCE
    SPEED
    CONSISTENCY
    CHALLENGE
    SPECIAL_EVENT
  }

  type User {
    id: ID!
    address: String!
    username: String
    email: String
    createdAt: Date!
    updatedAt: Date!
  }

  type BikeAttributes {
    speed: Int!
    endurance: Int!
    agility: Int!
    strength: Int!
    balance: Int!
    reflexes: Int!
    resilience: Int!
  }

  type BikeNFT {
    id: ID!
    tokenId: Int!
    owner: String!
    rarity: BikeRarity!
    attributes: BikeAttributes!
    metadataURI: String!
    level: Int!
    experience: Int!
    createdAt: Date!
    updatedAt: Date!
  }

  type GeoPoint {
    latitude: Float!
    longitude: Float!
    timestamp: Date!
  }

  type Activity {
    id: ID!
    userId: String!
    distance: Float!
    duration: Int!
    averageSpeed: Float!
    calories: Int!
    route: [GeoPoint!]
    timestamp: Date!
    verified: Boolean!
    rewardsClaimed: Boolean!
    potentialReward: Float
  }

  type Reward {
    id: ID!
    userId: String!
    activityId: String!
    amount: Float!
    type: RewardType!
    claimed: Boolean!
    claimedAt: Date
    createdAt: Date!
  }

  type TokenBalance {
    userId: String!
    balance: Float!
    lockedBalance: Float!
    totalEarned: Float!
    totalSpent: Float!
    lastUpdated: Date!
  }

  type LeaderboardEntry {
    userId: String!
    username: String
    value: Float!
    rank: Int!
    change: Int!
  }

  type PaginatedActivities {
    activities: [Activity!]!
    total: Int!
    page: Int!
    limit: Int!
    hasNext: Boolean!
    hasPrev: Boolean!
  }

  type Query {
    # User queries
    user(address: String!): User
    users(limit: Int = 10, offset: Int = 0): [User!]!

    # Activity queries
    activities(userId: String!, page: Int = 1, limit: Int = 10): PaginatedActivities!
    activity(id: ID!): Activity
    userStats(userId: String!): UserStats

    # NFT queries
    userBikes(owner: String!): [BikeNFT!]!
    bike(tokenId: Int!): BikeNFT

    # Reward queries
    userRewards(userId: String!): [Reward!]!
    tokenBalance(userId: String!): TokenBalance

    # Leaderboard queries
    leaderboard(type: String!, period: String!, limit: Int = 10): [LeaderboardEntry!]!
  }

  type UserStats {
    totalDistance: Float!
    totalActivities: Int!
    totalRewards: Float!
    averageSpeed: Float!
    longestRide: Float!
    currentStreak: Int!
  }

  input ActivityInput {
    distance: Float!
    duration: Int!
    averageSpeed: Float!
    calories: Int!
    route: [GeoPointInput!]
  }

  input GeoPointInput {
    latitude: Float!
    longitude: Float!
    timestamp: Date!
  }

  input BikeAttributesInput {
    speed: Int!
    endurance: Int!
    agility: Int!
    strength: Int!
    balance: Int!
    reflexes: Int!
    resilience: Int!
  }

  type Mutation {
    # User mutations
    createUser(address: String!, username: String, email: String): User!
    updateUser(address: String!, username: String, email: String): User!

    # Activity mutations
    createActivity(userId: String!, activity: ActivityInput!): Activity!
    verifyActivity(activityId: ID!): Activity!
    claimRewards(activityId: ID!): Reward!

    # NFT mutations
    mintBike(owner: String!, rarity: BikeRarity!, metadataURI: String!): BikeNFT!
    evolveBike(tokenId: Int!): BikeNFT!
    fuseBikes(tokenIds: [Int!]!, metadataURI: String!): BikeNFT!

    # Reward mutations
    distributeRewards(userId: String!, amount: Float!, type: RewardType!): Boolean!
  }

  type Subscription {
    activityUpdated(userId: String!): Activity!
    rewardEarned(userId: String!): Reward!
    leaderboardUpdated(type: String!): [LeaderboardEntry!]!
  }
`;
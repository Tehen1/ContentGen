# FixieRun Backend API Specification

## Authentication

- JWT-based authentication for user sessions
- OAuth2/OpenID Connect for integrating with wallet providers (optionally)

---

## Activity Tracking APIs

### POST `/api/activities/start`
Start a new activity session.

**Request Body:**
```json
{
  "activity_type": "run" | "bike",
  "start_time": "2023-04-10T09:00:00Z"
}
```
**Response:**
```json
{
  "activity_id": "string",
  "status": "started"
}
```

---

### POST `/api/activities/{activity_id}/location`
Add a location point to an ongoing activity session.

**Request Body:**
```json
{
  "timestamp": "2023-04-10T09:05:00Z",
  "latitude": 37.774,
  "longitude": -122.419,
  "altitude": 10.4,
  "accuracy": 5.0
}
```

---

### POST `/api/activities/stop`
Complete and store a recorded activity.

**Request Body:**
```json
{
  "activity_id": "string",
  "end_time": "2023-04-10T09:50:00Z"
}
```
**Response:**
```json
{
  "activity_id": "string",
  "summary": {
    "distance": 5.2,
    "duration": 50,
    "calories": 400,
    "tokens_earned": 30
  }
}
```

---

### GET `/api/activities/history`
Retrieve activity history for the authenticated user.

**Query Params:** `start_date`, `end_date`
**Response:** Array of activity summaries.

---

## NFT Management APIs

### POST `/api/nfts/mint`
Mint a new NFT for activity completion or as a reward.

**Request Body:**
```json
{
  "type": "shoe" | "badge" | "collectible",
  "metadata_url": "ipfs://...",
  "activity_id": "string"
}
```
**Response:**
```json
{
  "nft_id": "string",
  "transaction_hash": "0x..."
}
```

---

### GET `/api/nfts`
List NFTs owned by the authenticated user.

---

### POST `/api/marketplace/list`
List an NFT for sale.
```json
{
  "nft_id": "string",
  "price": 100
}
```

---

### POST `/api/marketplace/buy`
Purchase an NFT.
```json
{
  "nft_id": "string"
}
```

---

## Security

- All routes require authentication.
- Activity/NFT operations are rate-limited and validated against user ownership.
- All purchase/mint actions verified on-chain with a webhook/callback system.
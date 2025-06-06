# FixieRun Database Schema

This schema covers users, activities, location points, NFTs, marketplace listings, and NFT metadata.

---

## Users

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    wallet_address VARCHAR(64) UNIQUE NOT NULL,
    username VARCHAR(32) UNIQUE,
    email VARCHAR(128),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Activities

```sql
CREATE TABLE activities (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    activity_type VARCHAR(8) NOT NULL,    -- 'run', 'bike'
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    distance FLOAT,
    duration INT,
    calories FLOAT,
    tokens_earned FLOAT,
    gps_accuracy_avg FLOAT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Activity Location Points

```sql
CREATE TABLE activity_points (
    id SERIAL PRIMARY KEY,
    activity_id UUID REFERENCES activities(id),
    timestamp TIMESTAMP NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    altitude DOUBLE PRECISION,
    accuracy FLOAT
);
```

---

## NFTs

```sql
CREATE TABLE nfts (
    id UUID PRIMARY KEY,
    owner_id UUID REFERENCES users(id),
    mint_tx_hash VARCHAR(128),
    metadata_url VARCHAR(256),
    type VARCHAR(32),                    -- 'shoe', 'badge', 'collectible'
    rarity VARCHAR(16),
    level INT DEFAULT 1,
    activity_id UUID REFERENCES activities(id),  -- earned from activity
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_transfer_at TIMESTAMP
);
```

---

## NFT Marketplace Listings

```sql
CREATE TABLE marketplace_listings (
    id UUID PRIMARY KEY,
    nft_id UUID REFERENCES nfts(id),
    seller_id UUID REFERENCES users(id),
    price FLOAT NOT NULL,
    currency VARCHAR(16) DEFAULT 'FIXIE',
    status VARCHAR(16) DEFAULT 'active',     -- 'active', 'sold', 'cancelled'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sold_at TIMESTAMP
);
```

---

## NFT Metadata (Optional Extended Table)

```sql
CREATE TABLE nft_metadata (
    id UUID PRIMARY KEY,
    nft_id UUID REFERENCES nfts(id),
    name VARCHAR(64),
    description TEXT,
    image_url VARCHAR(256),
    attributes JSONB,         -- rarity, boosts, cosmetic props, etc.
    external_url VARCHAR(256)
);
```

---

# Index Suggestions

- Index `activities` by `user_id`
- Index `nfts` by `owner_id` and `type`
- Index `marketplace_listings` by `status` and `nft_id`
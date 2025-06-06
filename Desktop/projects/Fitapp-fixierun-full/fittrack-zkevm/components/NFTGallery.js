import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Empty, Spin, Tag, Button, Modal, Divider, Statistic, Tooltip, Badge } from 'antd';
import { TrophyOutlined, AreaChartOutlined, FireOutlined, ClockCircleOutlined, LinkOutlined, CopyOutlined, StarOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

// Rarity levels and their corresponding colors
const RARITY_LEVELS = {
  COMMON: { name: 'Common', color: '#8c8c8c' },
  UNCOMMON: { name: 'Uncommon', color: '#52c41a' },
  RARE: { name: 'Rare', color: '#1890ff' },
  EPIC: { name: 'Epic', color: '#722ed1' },
  LEGENDARY: { name: 'Legendary', color: '#faad14' },
  MYTHIC: { name: 'Mythic', color: '#f5222d' },
};

const NFTCard = ({ nft, onClick }) => {
  const rarityLevel = RARITY_LEVELS[nft.rarity] || RARITY_LEVELS.COMMON;
  
  return (
    <Badge.Ribbon 
      text={rarityLevel.name} 
      color={rarityLevel.color}
    >
      <Card
        hoverable
        cover={
          <div 
            style={{ 
              height: 200, 
              overflow: 'hidden',
              position: 'relative',
              background: `linear-gradient(135deg, ${rarityLevel.color}22, ${rarityLevel.color}44)`,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {nft.imageUrl ? (
              <img 
                alt={nft.name} 
                src={nft.imageUrl}
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
              />
            ) : (
              <div style={{ fontSize: 64, color: rarityLevel.color }}>
                {nft.type === 'ACHIEVEMENT' && <TrophyOutlined />}
                {nft.type === 'STREAK' && <FireOutlined />}
                {nft.type === 'MILESTONE' && <AreaChartOutlined />}
                {nft.type === 'SPECIAL' && <StarOutlined />}
              </div>
            )}
            
            {nft.tokenId && (
              <div 
                style={{ 
                  position: 'absolute', 
                  bottom: 8, 
                  right: 8, 
                  background: 'rgba(0,0,0,0.6)', 
                  padding: '2px 6px',
                  borderRadius: 4,
                  fontSize: 12,
                  color: 'white'
                }}
              >
                #{nft.tokenId}
              </div>
            )}
          </div>
        }
        onClick={() => onClick(nft)}
        style={{ marginBottom: 16 }}
      >
        <Card.Meta
          title={nft.name}
          description={
            <>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Earned {new Date(nft.dateEarned).toLocaleDateString()}
              </Text>
              <div style={{ marginTop: 8 }}>
                <Tag color={getTypeColor(nft.type)}>{formatType(nft.type)}</Tag>
              </div>
            </>
          }
        />
      </Card>
    </Badge.Ribbon>
  );
};

// Helper function to get color based on NFT type
const getTypeColor = (type) => {
  switch (type) {
    case 'ACHIEVEMENT': return '#1890ff';
    case 'STREAK': return '#fa8c16';
    case 'MILESTONE': return '#52c41a';
    case 'SPECIAL': return '#722ed1';
    default: return '#8c8c8c';
  }
};

// Helper function to format NFT type for display
const formatType = (type) => {
  return type.charAt(0) + type.slice(1).toLowerCase();
};

const NFTGallery = ({ nfts = [], loading = false, onTransfer }) => {
  const [filteredNfts, setFilteredNfts] = useState([]);
  const [selectedNft, setSelectedNft] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  
  useEffect(() => {
    setFilteredNfts(nfts);
  }, [nfts]);
  
  const handleNftClick = (nft) => {
    setSelectedNft(nft);
    setModalVisible(true);
  };

  const handleTransfer = () => {
    if (selectedNft && onTransfer) {
      onTransfer(selectedNft);
      setModalVisible(false);
    }
  };

  const handleCopyAddress = () => {
    if (selectedNft?.contractAddress) {
      navigator.clipboard.writeText(selectedNft.contractAddress)
        .then(() => {
          // Could display a notification here
          console.log('Contract address copied to clipboard');
        })
        .catch(err => {
          console.error('Failed to copy: ', err);
        });
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <Spin size="large" />
        <Text style={{ display: 'block', marginTop: 16 }}>Loading your NFT collection...</Text>
      </div>
    );
  }

  return (
    <div className="nft-gallery-container">
      <Card 
        title={<Title level={4}>Fitness NFT Gallery</Title>} 
        extra={<Text>{nfts.length} NFTs earned</Text>}
        style={{ marginBottom: 20 }}
      >
        {nfts.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <span>
                You haven't earned any fitness NFTs yet. <br />
                Complete achievements to earn your first NFT!
              </span>
            }
          />
        ) : (
          <Row gutter={[16, 16]}>
            {filteredNfts.map((nft, index) => (
              <Col xs={24} sm={12} md={8} lg={6} key={nft.id || index}>
                <NFTCard nft={nft} onClick={handleNftClick} />
              </Col>
            ))}
          </Row>
        )}
      </Card>

      <Modal
        title={selectedNft?.name || 'NFT Details'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setModalVisible(false)}>
            Close
          </Button>,
          selectedNft && (
            <Button 
              key="transfer" 
              type="primary"
              onClick={handleTransfer}
            >
              Transfer NFT
            </Button>
          )
        ]}
        width={600}
      >
        {selectedNft && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div 
                style={{ 
                  height: 250, 
                  overflow: 'hidden',
                  position: 'relative',
                  background: `linear-gradient(135deg, ${getTypeColor(selectedNft.type)}22, ${getTypeColor(selectedNft.type)}44)`,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  margin: '0 auto 20px',
                  borderRadius: 8,
                }}
              >
                {selectedNft.imageUrl ? (
                  <img 
                    alt={selectedNft.name} 
                    src={selectedNft.imageUrl}
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
                  />
                ) : (
                  <div style={{ fontSize: 96, color: getTypeColor(selectedNft.type) }}>
                    {selectedNft.type === 'ACHIEVEMENT' && <TrophyOutlined />}
                    {selectedNft.type === 'STREAK' && <FireOutlined />}
                    {selectedNft.type === 'MILESTONE' && <AreaChartOutlined />}
                    {selectedNft.type === 'SPECIAL' && <StarOutlined />}
                  </div>
                )}
              </div>
              <Title level={3}>{selectedNft.name}</Title>
              <Tag color={RARITY_LEVELS[selectedNft.rarity]?.color || '#8c8c8c'} style={{ fontSize: 14, padding: '4px 8px' }}>
                {RARITY_LEVELS[selectedNft.rarity]?.name || 'Common'} Rarity
              </Tag>
            </div>

            <Divider orientation="left">Metadata</Divider>
            
            <Row gutter={16}>
              <Col span={8}>
                <Statistic 
                  title="Token ID" 
                  value={selectedNft.tokenId || 'N/A'} 
                  valueStyle={{ fontSize: 16 }}
                />
              </Col>
              <Col span={8}>
                <Statistic 
                  title="Type" 
                  value={formatType(selectedNft.type)} 
                  valueStyle={{ color: getTypeColor(selectedNft.type), fontSize: 16 }}
                />
              </Col>
              <Col span={8}>
                <Statistic 
                  title="Date Earned" 
                  value={new Date(selectedNft.dateEarned).toLocaleDateString()} 
                  valueStyle={{ fontSize: 16 }}
                />
              </Col>
            </Row>
            
            <Divider orientation="left">Description</Divider>
            <Paragraph>{selectedNft.description}</Paragraph>
            
            {selectedNft.attributes && selectedNft.attributes.length > 0 && (
              <>
                <Divider orientation="left">Attributes</Divider>
                <Row gutter={[16, 16]}>
                  {selectedNft.attributes.map((attr, index) => (
                    <Col span={8} key={index}>
                      <Card size="small">
                        <Text type="secondary">{attr.trait_type}</Text>
                        <div><Text strong>{attr.value}</Text></div>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </>
            )}
            
            {selectedNft.contractAddress && (
              <>
                <Divider orientation="left">Blockchain Info</Divider>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Text style={{ marginRight: 8 }}>Contract Address:</Text>
                  <Text code ellipsis style={{ maxWidth: '300px' }}>
                    {selectedNft.contractAddress}
                  </Text>
                  <Tooltip title="Copy Address">
                    <Button 
                      type="text" 
                      icon={<CopyOutlined />} 
                      onClick={handleCopyAddress}
                      style={{ marginLeft: 8 }}
                    />
                  </Tooltip>
                  {selectedNft.explorerUrl && (
                    <Tooltip title="View on Explorer">
                      <Button 
                        type="text" 
                        icon={<LinkOutlined />} 
                        onClick={() => window.open(selectedNft.explorerUrl, '_blank')}
                      />
                    </Tooltip>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default NFTGallery;


import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Plus } from 'lucide-react-native';

export default function NftCollection() {
  const { colors } = useTheme();

  // Sample NFT collection data
  const nfts = [
    { id: '1', name: 'Daily Streak', image: 'https://images.pexels.com/photos/1106476/pexels-photo-1106476.jpeg' },
    { id: '2', name: 'Marathon Runner', image: 'https://images.pexels.com/photos/2559941/pexels-photo-2559941.jpeg' },
    { id: '3', name: 'Cycling Pro', image: 'https://images.pexels.com/photos/5867453/pexels-photo-5867453.jpeg' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {nfts.map((nft) => (
          <TouchableOpacity 
            key={nft.id}
            style={[styles.nftCard, { backgroundColor: colors.card }]}
          >
            <Image 
              source={{ uri: nft.image }}
              style={styles.nftImage}
            />
            <Text style={[styles.nftName, { color: colors.text }]}>
              {nft.name}
            </Text>
          </TouchableOpacity>
        ))}
        
        <TouchableOpacity style={[styles.addCard, { borderColor: colors.border }]}>
          <Plus size={24} color={colors.secondaryText} />
          <Text style={[styles.addText, { color: colors.secondaryText }]}>
            Mint New
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  scrollContent: {
    paddingRight: 16,
  },
  nftCard: {
    width: 150,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 16,
  },
  nftImage: {
    width: '100%',
    height: 150,
  },
  nftName: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    padding: 12,
  },
  addCard: {
    width: 150,
    height: 198,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginTop: 8,
  },
});
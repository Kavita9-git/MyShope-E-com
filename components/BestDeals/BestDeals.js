import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native';

const bestDealsData = [
  {
    id: '1',
    // title: 'Ethnic Sets',
    // subtitle: 'Under ₹799',
    image: 'https://assets.myntassets.com/f_webp,w_163,c_limit,fl_progressive,dpr_2.0/assets/images/2025/SEPTEMBER/10/NKgaJWXS_1a9633f7982347a59fc298d68fe9e6e2.jpg',
  },
  {
    id: '2',
    // title: 'Smart Cameras',
    // subtitle: 'From ₹999',
    image: 'https://assets.myntassets.com/f_webp,w_163,c_limit,fl_progressive,dpr_2.0/assets/images/2025/SEPTEMBER/10/7RuyNIfm_6d287c418718450f92acd1d50f6f77ac.jpg',
  },
  {
    id: '3',
    // title: 'Casual Shirts',
    // subtitle: 'From ₹499',
    image: 'https://assets.myntassets.com/f_webp,w_163,c_limit,fl_progressive,dpr_2.0/assets/images/2025/SEPTEMBER/10/dCsgxX0K_c3bcc068e7eb48d49123b4713c832266.jpg',
  },
  {
    id: '4',
    // title: 'Watches',
    // subtitle: 'From ₹799',
    image: 'https://assets.myntassets.com/f_webp,w_163,c_limit,fl_progressive,dpr_2.0/assets/images/2025/SEPTEMBER/10/5YMC9owN_1ba5c8b696fa46aea87c3169821c3e57.jpg',
  },
];

const BestDeals = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Best Deals</Text>
      <FlatList
        data={bestDealsData}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card}>
            <Image source={{ uri: item.image }} style={styles.image} />
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default BestDeals;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  title: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  card: {
    marginRight: 12,
    alignItems: 'center',
    width: 100,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3, 
    elevation: 3,
  },
  image: {
    width: 100,
    height: 120,
    borderRadius: 8,
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: 11,
    color: '#888',
  },
});

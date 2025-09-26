import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux'; // ⬅️ Import to access categories from Redux

const bestDealsData = [
  {
    id: '1',
    image: 'https://assets.myntassets.com/f_webp,w_163,c_limit,fl_progressive,dpr_2.0/assets/images/2025/SEPTEMBER/10/5YMC9owN_1ba5c8b696fa46aea87c3169821c3e57.jpg',
  },
  {
    id: '2',
    image: 'https://assets.myntassets.com/f_webp,w_163,c_limit,fl_progressive,dpr_2.0/assets/images/2025/SEPTEMBER/10/78FfQYIC_919fcb5e0853428f91d82ff22abb0330.jpg',
  },
  {
    id: '3',
    image: 'https://assets.myntassets.com/f_webp,w_163,c_limit,fl_progressive,dpr_2.0/assets/images/2025/SEPTEMBER/10/pthvTXAF_4625344710f6482daf30cee28141f5c6.jpg',
  },
  {
    id: '4',
    image: 'https://assets.myntassets.com/f_webp,w_163,c_limit,fl_progressive,dpr_2.0/assets/images/2025/SEPTEMBER/10/vE8kOjRa_18df9b4bfda34a7c89f49f68bb0ee7dc.jpg',
  },
  {
    id: '5',
    image: 'https://assets.myntassets.com/f_webp,w_163,c_limit,fl_progressive,dpr_2.0/assets/images/2025/SEPTEMBER/10/7RuyNIfm_6d287c418718450f92acd1d50f6f77ac.jpg',
  },
  {
    id: '6',
    image: 'https://assets.myntassets.com/f_webp,w_163,c_limit,fl_progressive,dpr_2.0/assets/images/2025/SEPTEMBER/10/dCsgxX0K_c3bcc068e7eb48d49123b4713c832266.jpg',
  },
  {
    id: '7',
    image: 'https://assets.myntassets.com/f_webp,w_163,c_limit,fl_progressive,dpr_2.0/assets/images/2025/SEPTEMBER/10/NKgaJWXS_1a9633f7982347a59fc298d68fe9e6e2.jpg',
  },
];

const BestDeals = () => {
  const navigation = useNavigation();
  const { categories } = useSelector((state) => state.category); // ⬅️ Access Redux categories

  const handlePress = () => {
    const clothesCategory = categories.find(
      (cat) => cat.category?.toLowerCase() === 'clothes'
    );

    if (clothesCategory) {
      navigation.navigate('CategoryProducts', {
        categoryId: clothesCategory._id,
        categoryName: clothesCategory.category,
      });
    } else {
      console.warn('Clothes category not found');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Trending</Text>
      <FlatList
        data={bestDealsData}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={handlePress}>
            <Image source={{ uri: item.image }} style={styles.image} />
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
    backgroundColor: '#d7ecff',
  },
  title: {
    fontSize: 11,
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
    elevation: 2,
  },
  image: {
    width: 100,
    height: 150,
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

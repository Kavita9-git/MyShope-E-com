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
import { useSelector } from 'react-redux'; // ✅ For accessing categories

const TrendingData = [
  {
    id: '1',
    image:
      'https://assets.myntassets.com/f_webp,w_196,c_limit,fl_progressive,dpr_2.0/assets/images/2025/SEPTEMBER/8/BL3ykC3I_a29ed6515e6f40c68ca8701c4560d0ab.png',
  },
  {
    id: '2',
    image:
      'https://assets.myntassets.com/f_webp,w_196,c_limit,fl_progressive,dpr_2.0/assets/images/2025/SEPTEMBER/8/5GQOSaLO_32acf880e8144d5bb836645aa474493f.png',
  },
  {
    id: '3',
    image:
      'https://assets.myntassets.com/f_webp,w_196,c_limit,fl_progressive,dpr_2.0/assets/images/2025/SEPTEMBER/8/PhLwSLU7_ce697a22418643ceac09b42b9ce82535.png',
  },
  {
    id: '4',
    image:
      'https://assets.myntassets.com/f_webp,w_196,c_limit,fl_progressive,dpr_2.0/assets/images/2025/SEPTEMBER/8/3yvAHPqK_dc0c784cc2484a84a3bec58728c4610d.png',
  },
  {
    id: '5',
    image:
      'https://assets.myntassets.com/f_webp,w_196,c_limit,fl_progressive,dpr_2.0/assets/images/2025/SEPTEMBER/8/cT71PDwr_e888db17b4364ec0ac21e85ca7457693.png',
  },
  {
    id: '6',
    image:
      'https://assets.myntassets.com/f_webp,w_196,c_limit,fl_progressive,dpr_2.0/assets/images/2025/SEPTEMBER/8/PJTnw7Gu_cce7aa1a44ec4ee3936fea9f600f2ef6.png',
  },
  {
    id: '7',
    image:
      'https://assets.myntassets.com/f_webp,w_196,c_limit,fl_progressive,dpr_2.0/assets/images/2025/SEPTEMBER/8/R7llxO4b_721606288d204a61989fb3e14da49b82.png',
  },
  {
    id: '8',
    image:
      'https://assets.myntassets.com/f_webp,w_196,c_limit,fl_progressive,dpr_2.0/assets/images/2025/SEPTEMBER/8/Pq3Y4Pkp_ed62b7b652c048ff9eeeadc560183b71.png',
  },
];

const Trending = () => {
  const navigation = useNavigation();
  const { categories } = useSelector((state) => state.category); // ✅ Redux state

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
      console.warn('Clothes category not found in Redux');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Best Deals</Text>
      <FlatList
        data={TrendingData}
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

export default Trending;

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

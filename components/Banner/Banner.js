import React from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  Dimensions,
  Pressable,
} from "react-native";
import Carousel, { PaginationLight } from "react-native-x-carousel";
import { BannerData } from "../../data/BannerData"; 

const { width } = Dimensions.get("window");

const Banner = () => {
  const renderItem = (data) => (
    <View key={data.coverImageUri} style={styles.cardContainer}>
      <Pressable onPress={() => alert(data._id)}>
        <View style={styles.cardWrapper}>
          <Image
            style={styles.card}
            source={{
              uri: data?.coverImageUri.startsWith("http")
                ? data?.coverImageUri
                : `https://nodejsapp-hfpl.onrender.com${data?.coverImageUri}`,
            }}
          />
          <View
            style={[
              styles.cornerLabel,
              { backgroundColor: data.cornerLabelColor },
            ]}
          >
            <Text style={styles.cornerLabelText}>{data.cornerLabelText}</Text>
          </View>
        </View>
      </Pressable>
    </View>
  );

  return (
    <View style={styles.container}>
      <Carousel
        pagination={PaginationLight}
        renderItem={renderItem}
        data={BannerData}
        loop
        autoplay
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width,                 // full device width
    marginBottom: 20,
    backgroundColor: "#fff",
  },
  cardContainer: {
    width,
    alignItems: "center",
    justifyContent: "center",
  },
  cardWrapper: {
    width,
    overflow: "hidden",
  },
  card: {
    width,                // full width (removed -30)
    height: 180,          // adjust as needed
    resizeMode: "cover",
  },
  cornerLabel: {
    position: "absolute",
    bottom: 0,
    right: 0,
    borderTopLeftRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  cornerLabelText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "600",
  },
});

export default Banner;

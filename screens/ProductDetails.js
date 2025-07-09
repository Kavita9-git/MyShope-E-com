import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { useRef } from "react";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  removeFromCart,
  clearCart,
  addToCart,
  decreaseQty,
  increaseQty,
} from "../redux/features/auth/cartActions";
import AntDesign from "react-native-vector-icons/AntDesign";
import { ProductsData } from "../data/ProductsData";
import Layout from "../components/Layout/Layout";

//get screen width
const screenWidth = Dimensions.get("window").width;

const ProductDetails = ({ route }) => {
  const dispatch = useDispatch();
  const { products } = useSelector((state) => state.product);
  // console.log(products);
  // console.log(route);
  // console.log(route.params?._id);

  const [pDetails, setPtDetails] = useState([]);
  const [qty, setQty] = useState(1);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef(null);

  const singleProductData = products;
  // console.log("params id:", params?._id);

  //Get Products Details from Route Params id
  useEffect(() => {
    //Find Product Details
    const getProduct = singleProductData.find((p) => {
      return p?._id === route.params?._id;
    });
    // console.log(getProduct);
    setPtDetails(getProduct);
    // console.log("pDetails :", pDetails);
  }, [route.params?._id]);

  //Handle Function For Quantity Change + -
  const handleAddQty = () => {
    if (qty === pDetails?.stock) return alert("Max quantity allowed is 10");
    setQty(() => qty + 1);
  };

  const handleRemoveQty = () => {
    if (qty < 1) return;
    setQty(() => qty - 1);
  };

  const handleScroll = (event) => {
    const x = event.nativeEvent.contentOffset.x;
    const index = Math.round(x / screenWidth);
    setCurrentIndex(index);
  };

  const scrollToIndex = (index) => {
    scrollRef.current?.scrollTo({ x: index * screenWidth, animated: true });
    setCurrentIndex(index);
  };

  const goToNext = () => {
    if (currentIndex < (pDetails?.images?.length || 1) - 1) {
      scrollToIndex(currentIndex + 1);
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      scrollToIndex(currentIndex - 1);
    }
  };

  const handleAddToCart = (p) => {
    // console.log("p", p);
    dispatch(
      addToCart({
        productId: p._id,
        name: p.name,
        price: p.price,
        image: p.images?.[0].url,
        quantity: qty,
      })
    );
  };

  const { params } = route;
  return (
    <Layout>
      {/*<Image source={{ uri: pDetails?.images?.[0].url }} style={styles.image} />*/}
      <View style={{ height: 350, marginBottom: 10 }}>
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {pDetails?.images?.map((img, index) => (
            <Image
              key={index}
              source={{ uri: img.url }}
              style={styles.imageCarousel}
            />
          ))}
        </ScrollView>

        {/* Dots Indicator */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            marginTop: 10,
          }}
        >
          {pDetails?.images?.map((_, index) => (
            <View
              key={index}
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                margin: 4,
                backgroundColor: currentIndex === index ? "#000" : "#ccc",
              }}
            />
          ))}
        </View>

        {/* Prev / Next buttons */}
        <View style={styles.carouselButtons}>
          <TouchableOpacity onPress={goToPrev} disabled={currentIndex === 0}>
            <Text style={styles.carouselButtonText}>{"< "}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={goToNext}
            disabled={currentIndex === (pDetails?.images?.length || 1) - 1}
          >
            <Text style={styles.carouselButtonText}>{" >"}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View styles={styles.container}>
        <Text style={styles.title}>{pDetails?.name}</Text>
        <Text style={styles.title}>Price : {pDetails?.price} $</Text>
        <Text style={styles.desc}>Desc : {pDetails?.description}</Text>
        <View style={styles.btnContainer}>
          {/* <TouchableOpacity
            style={styles.btnCart}
            onPress={() => alert("Product added to cart!")}
            disabled={pDetails?.quantity <= 0 ? true : false}
          >
            <Text style={styles.btnCartText}>
              {pDetails?.quantity > 0 ? "ADD TO CART" : "OUT OF STOCK"}
            </Text>
          </TouchableOpacity> */}

          <TouchableOpacity
            style={styles.btnCart}
            onPress={() => handleAddToCart(pDetails)}
            disabled={pDetails?.stock <= 0 ? true : false}
          >
            <Text style={styles.btnCartText}>
              {pDetails?.stock > 0 ? "ADD TO CART" : "OUT OF STOCK"}
            </Text>
          </TouchableOpacity>

          <View style={styles.btnContainer}>
            <TouchableOpacity
              style={styles.btnQty}
              onPress={() => handleRemoveQty()}
            >
              <Text styles={styles.btnQtyText}>-</Text>
            </TouchableOpacity>
            <Text>{qty}</Text>
            <TouchableOpacity
              style={styles.btnQty}
              onPress={() => handleAddQty()}
            >
              <Text styles={styles.btnQtyText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  image: {
    height: 350,
    width: "100%",
  },
  container: {
    marginVertical: 15,
    marginHorizontal: 10,
  },
  title: {
    fontSize: 24,
    textAlign: "left",
  },
  desc: {
    fontSize: 12,
    textTransform: "capitalize",
    textAlign: "justify",
    marginVertical: 10,
  },
  btnContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,
    marginHorizontal: 10,
  },
  btnCart: {
    width: 180,
    backgroundColor: "#000000",
    // marginVertical: 10,
    borderRadius: 5,
    height: 40,
    justifyContent: "center",
  },
  btnCartText: {
    color: "#ffffff",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16,
  },
  btnQty: {
    backgroundColor: "lightgray",
    width: 40,
    alignItems: "center",
    marginHorizontal: 10,
  },
  btnQtyText: {
    fontSize: 20,
  },
  catIcon: {
    fontSize: 20,
    verticalAlign: "top",
  },
  imageCarousel: {
    width: screenWidth,
    height: 350,
    resizeMode: "cover",
  },
  carouselButtons: {
    position: "absolute",
    top: "45%",
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  carouselButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    backgroundColor: "rgba(0,0,0,0.5)",
    color: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
});
export default ProductDetails;

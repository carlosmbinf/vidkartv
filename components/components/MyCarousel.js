import * as React from "react";
import { Image, View } from "react-native";
import { Text } from "react-native-paper";
import { VideoPlayer } from "../video/VideoPlayerViejo";
 
const COUNT = 6;
 
function Index() {
  const [isVertical, setIsVertical] = React.useState(false);
  const [isFast, setIsFast] = React.useState(false);
  const [isAutoPlay, setIsAutoPlay] = React.useState(false);
 const dataPelisRandom = [
    { id: 1, title: "Peli 1", img: "https://picsum.photos/200/300" },
    { id: 2, title: "Peli 2", img: "https://picsum.photos/200/300" },
    { id: 3, title: "Peli 3", img: "https://picsum.photos/200/300" },
    { id: 4, title: "Peli 4", img: "https://picsum.photos/200/300" },
    { id: 5, title: "Peli 5", img: "https://picsum.photos/200/300" }
 ]

 const renderItem = ({id, title, img }) => {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>{title}</Text>
        <Image source={{ uri: img }} style={{ width: 200, height: 300 }} />
      </View>
    );
  }
  return (
    <View style={{ flex: 1 }}>
        <VideoPlayer />
    </View>
  );
}
 
export default Index;
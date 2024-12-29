import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Title, Paragraph, Text } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const CardInfoSerie = ({item}) => {
    const  nombre = item && item.nombre;
    const  descripcion = item && item.descripcion;
    const vistas = item && item.vistas;
    const extension = item && item.extension;
    const year = item && item.year;
    // const {nombre , descripcion, vistas, extension, year } = item;
  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          
          <View style={styles.infoDescripcion}>
          <Title style={styles.title}>{nombre}</Title>
          <Paragraph numberOfLines={4} style={styles.description}>{descripcion}</Paragraph>
          </View>
          <View style={styles.infoRow}>
            <View style={{flexDirection: 'row' , justifyContent: 'space-around', alignContent:'flex-end'}}>
                <Text style={styles.infoText}>year: {year}</Text>
                <Text style={styles.infoText}>Extension: {extension}</Text>
                <Text style={styles.infoText}><MaterialCommunityIcons name="eye" size={24} color="white" />  {vistas}</Text>
            </View>
            
          </View>
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 0,
    alignItems: 'center',
    paddingBottom: 30,
    paddingTop: 15,
    
  },
  card: {
    minWidth: "100%", // Ajusta según la resolución de tu app para TV
    height: 200,
    // flex: 1,
    flexWrap: "wrap",
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    overflow: 'hidden',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  description: {
    // backgroundColor: "red",
    fontSize: 10,
    color: '#b0b0b0',
    marginVertical: 8,
  },
  infoRow: {
    alignContent: "space-between",
    // flexGrow: 1,
    minWidth:'100%',
    // backgroundColor: "red",
    height: "15%",
    flexDirection: 'column-reverse',
    // justifyContent: 'flex-end',
    ali: "flex-end",
    marginTop: 8,
  },
  infoDescripcion: {
    height: "80%",
    // flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 8,
  },
  infoText: {
    alignItems: "center",
    alignContent: 'center',
    fontSize: 14,
    color: '#a0a0a0',
  },
});

export default CardInfoSerie;

import Meteor from '@meteorrn/core';
import * as React from 'react';
import {ScrollView, Dimensions} from 'react-native';
import {Card, Drawer, Surface} from 'react-native-paper';

import img from './SGN_04_02_2021_1617417653789.png';
const {width: screenWidth} = Dimensions.get('window');
const {height: screenHeight} = Dimensions.get('window');
const DrawerOptionsAlls = opt => {
  const {active, setActive, opcionesServicios} = opt;

  const opcionesAdministradores = [
    // {
    //   label: 'Agregar Usuarios',
    //   url: 'CreateUsers',
    //   icon: 'account-plus',
    // },
    // {
    //   label: "Mensajes",
    //   url:"AllMensajesUser",
    //   icon:"message"
    // },
    // {
    //   label: "Consumo Proxy",
    //   url:"ConsumoUsers",
    //   icon:"chart-donut"
    // }
  ];
  const opcionesAdministradorGeneral = [
    // {
    //   label: 'Registro de Logs',
    //   url: 'Logs',
    //   icon: 'vpn',
    // },
    // {
    //   label: 'Ventas',
    //   url: 'Ventas',
    //   icon: 'vpn',
    // },
  ];
  return (
    <>
      <ScrollView>
        <Surface>
          <Card.Cover source={img}></Card.Cover>
        </Surface>
        <Surface style={{minHeight: screenHeight - 180}}>
          <Drawer.Section title="Que desea Ver:">
            {opcionesServicios.map(element => {
              return (
                <Drawer.Item
                  icon={element.icon}
                  label={element.label}
                  active={active === element.url}
                  onPress={() => {
                    // setActive(element.url);
                    setActive(element.url);
                  }}
                />
              );
            })}
          </Drawer.Section>

          {/* <Drawer.Section title="Opciones de Administradores">
            {opcionesAdministradores.length > 0 &&
              opcionesAdministradores.map(element => {
                return (
                  <Drawer.Item
                    icon={element.icon}
                    label={element.label}
                    active={active === element.url}
                    onPress={() => {
                      // setActive(element.url);
                      // opt.navigation.navigation.navigate(element.url);
                    }}
                  />
                );
              })}
          </Drawer.Section>
          {Meteor.user().username == 'carlosmbinf' && (
            <Drawer.Section title="Opciones Privadas">
              {opcionesAdministradorGeneral.length > 0 &&
                opcionesAdministradorGeneral.map(element => {
                  return (
                    <Drawer.Item
                      icon={element.icon}
                      label={element.label}
                      active={active === element.url}
                      onPress={() => {
                        // setActive(element.url);
                        // opt.navigation.navigation.navigate(element.url);
                      }}
                    />
                  );
                })}
            </Drawer.Section>
          )} */}
        </Surface>
      </ScrollView>
    </>
  );
};

export default DrawerOptionsAlls;

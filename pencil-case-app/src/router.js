import React, { Component } from "react";
import { View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Welcome from "./screens/Welcome";
import Register from "./screens/Register";
import Login from "./screens/Login";
import Home from "./screens/Home";
import Attending from "./screens/Attending";
import {
  MaterialIcons,
  Ionicons,
  MaterialCommunityIcons
} from "@expo/vector-icons";
import { connect } from "react-redux";
import { logoutUser } from "./redux/actions";

const Stack = createStackNavigator();

const Tab = createBottomTabNavigator();

function Main() {
  return (
    <Tab.Navigator
      tabBarOptions={{
        activeTintColor: "#e3125c",
        inactiveTintColor: "white",
        style: { backgroundColor: "black" }
      }}
    >
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" color={color} size={size} />
          )
        }}
      />
      <Tab.Screen
        name="Attending"
        component={Attending}
        options={{
          tabBarLabel: "Attending",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="pencil" color={color} size={size} />
          )
        }}
      />
    </Tab.Navigator>
  );
}

class Router extends Component {
  render() {
    return (
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="Welcome"
            component={Welcome}
            options={{ header: () => null }}
          />
          <Stack.Screen
            name="Register"
            component={Register}
            options={{ header: () => null, gestureEnabled: false }}
          />
          <Stack.Screen
            name="Login"
            component={Login}
            options={{ header: () => null, gestureEnabled: false }}
          />
          <Stack.Screen
            name="Main"
            component={Main}
            options={({ navigation }) => ({
              headerLeft: () => (
                <Ionicons
                  name="md-exit"
                  size={35}
                  onPress={() => {
                    this.props.logoutUser();
                    navigation.navigate("Welcome");
                  }}
                  style={{ color: "white", marginLeft: 15 }}
                />
              ),
              headerTitle: "PENCILCASE",
              headerStyle: {
                backgroundColor: "black"
              },
              headerTintColor: "#e3125c",
              headerTitleStyle: {
                fontWeight: "bold"
              },
              gestureEnabled: false
            })}
          />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }
}

export default connect(
  null,
  { logoutUser }
)(Router);

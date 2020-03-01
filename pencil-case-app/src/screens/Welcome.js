import React, { Component } from "react";
import { View, Text, AsyncStorage } from "react-native";
import Slides from "../components/Slides";
import { logoutUser, setCurrentUser } from "../redux/actions";
import { connect } from "react-redux";
import jwt_decode from "jwt-decode";

const SLIDE_DATA = [
  { text: "Find volunteer opportunities.", color: "black" },
  { text: "Record hours.", color: "black" },
  { text: "Get rewarded for volunteering.", color: "black" }
];

class WelcomeScreen extends Component {
  async componentWillMount() {
    try {
      const token = await AsyncStorage.getItem("jwtToken");
      const decoded = jwt_decode(token);
      const currentTime = Date.now() / 1000;

      if (decoded.exp < currentTime) {
        this.props.logoutUser();
      } else {
        this.props.setCurrentUser(decoded);
        this.props.navigation.navigate("Main");
      }
    } catch (e) {
      console.log(e);
    }
  }

  render() {
    return (
      <Slides
        data={SLIDE_DATA}
        onComplete={() => this.props.navigation.navigate("Register")}
      />
    );
  }
}

export default connect(
  null,
  { logoutUser, setCurrentUser }
)(WelcomeScreen);

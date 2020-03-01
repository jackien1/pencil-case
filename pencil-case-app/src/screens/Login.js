import React, { Component } from "react";
import { View, Text, AsyncStorage } from "react-native";
import { Input, Button } from "react-native-elements";
import { changeLEmail, changeLPassword, handleLogin } from "../redux/actions";
import { connect } from "react-redux";

class Login extends Component {
  render() {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "black"
        }}
      >
        <Text
          style={{
            color: "white",
            fontSize: 30,
            fontWeight: "bold",
            marginBottom: 50
          }}
        >
          Login
        </Text>
        <Input
          inputStyle={{ color: "white" }}
          placeholderTextColor="white"
          placeholder="Email"
          titleStyle={{ fontSize: 18 }}
          value={this.props.auth.lEmail}
          onChangeText={text => this.props.changeLEmail(text)}
        />
        <Input
          inputStyle={{ color: "white" }}
          placeholderTextColor="white"
          placeholder="Password"
          secureTextEntry={true}
          titleStyle={{ fontSize: 18 }}
          value={this.props.auth.lPassword}
          onChangeText={text => this.props.changeLPassword(text)}
        />
        <Button
          title="Start"
          containerStyle={{ marginTop: 20 }}
          buttonStyle={{ backgroundColor: "#e3125c" }}
          titleStyle={{ fontSize: 20 }}
          onPress={() => {
            this.props.handleLogin(
              this.props.auth.lEmail,
              this.props.auth.lPassword,
              () => this.props.navigation.navigate("Main")
            );
          }}
        />
        <Button
          title="Back"
          type="clear"
          containerStyle={{ marginTop: 10 }}
          titleStyle={{ fontSize: 20, color: "white" }}
          onPress={() => this.props.navigation.goBack()}
        />
      </View>
    );
  }
}

const mapStateToProps = state => {
  const { auth } = state;
  return { auth };
};

export default connect(
  mapStateToProps,
  { changeLEmail, changeLPassword, handleLogin }
)(Login);

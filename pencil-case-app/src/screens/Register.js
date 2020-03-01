import React, { Component } from "react";
import { View, Text, AsyncStorage } from "react-native";
import { Input, Button } from "react-native-elements";
import { connect } from "react-redux";
import {
  changeUserName,
  changeSchool,
  changeLocation,
  changeEmail,
  changePassword,
  changePasswordConfirm,
  handleRegister
} from "../redux/actions";

class Register extends Component {
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
          PencilCase
        </Text>
        <Input
          inputStyle={{ color: "white" }}
          placeholderTextColor="white"
          placeholder="User Name"
          titleStyle={{ fontSize: 18 }}
          value={this.props.auth.userName}
          onChangeText={text => this.props.changeUserName(text)}
        />
        <Input
          inputStyle={{ color: "white" }}
          placeholderTextColor="white"
          placeholder="School"
          titleStyle={{ fontSize: 18 }}
          value={this.props.auth.school}
          onChangeText={text => this.props.changeSchool(text)}
        />
        <Input
          inputStyle={{ color: "white" }}
          placeholderTextColor="white"
          placeholder="Location"
          titleStyle={{ fontSize: 18 }}
          value={this.props.auth.location}
          onChangeText={text => this.props.changeLocation(text)}
        />
        <Input
          inputStyle={{ color: "white" }}
          placeholderTextColor="white"
          placeholder="Email"
          titleStyle={{ fontSize: 18 }}
          value={this.props.auth.email}
          onChangeText={text => this.props.changeEmail(text)}
        />
        <Input
          inputStyle={{ color: "white" }}
          placeholderTextColor="white"
          placeholder="Password"
          titleStyle={{ fontSize: 18 }}
          secureTextEntry={true}
          value={this.props.auth.password}
          onChangeText={text => this.props.changePassword(text)}
        />
        <Input
          inputStyle={{ color: "white" }}
          placeholderTextColor="white"
          placeholder="Confirm Password"
          titleStyle={{ fontSize: 18 }}
          secureTextEntry={true}
          value={this.props.auth.password_confirm}
          onChangeText={text => this.props.changePasswordConfirm(text)}
        />
        <Button
          title="Sign Up"
          containerStyle={{ marginTop: 20 }}
          buttonStyle={{ backgroundColor: "#e3125c" }}
          titleStyle={{ fontSize: 20 }}
          onPress={() => {
            this.props.handleRegister(
              this.props.auth.userName,
              this.props.auth.school,
              this.props.auth.location,
              this.props.auth.email,
              this.props.auth.password,
              this.props.auth.password_confirm,
              () => this.props.navigation.navigate("Main")
            );
          }}
        />
        <Button
          title="Login"
          type="clear"
          containerStyle={{ marginTop: 10 }}
          titleStyle={{ fontSize: 20, color: "white" }}
          onPress={() => this.props.navigation.navigate("Login")}
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
  {
    changeUserName,
    changeSchool,
    changeLocation,
    changeEmail,
    changePassword,
    changePasswordConfirm,
    handleRegister
  }
)(Register);

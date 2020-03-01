import * as types from "../types";
import { AsyncStorage } from "react-native";
import jwt_decode from "jwt-decode";
import axios from "axios";

export const changeUserName = userName => {
  return {
    type: types.CHANGE_USER_NAME,
    payload: userName
  };
};

export const changeSchool = school => {
  return {
    type: types.CHANGE_SCHOOL,
    payload: school
  };
};

export const changeLocation = location => {
  return {
    type: types.CHANGE_LOCATION,
    payload: location
  };
};

export const changeEmail = email => {
  return {
    type: types.CHANGE_EMAIL,
    payload: email
  };
};

export const changePassword = password => {
  return {
    type: types.CHANGE_PASSWORD,
    payload: password
  };
};

export const changePasswordConfirm = password_confirm => {
  return {
    type: types.CHANGE_PASSWORD_CONFIRM,
    payload: password_confirm
  };
};

export const changeLEmail = lEmail => {
  return {
    type: types.CHANGE_LEMAIL,
    payload: lEmail
  };
};

export const changeLPassword = lPassword => {
  return {
    type: types.CHANGE_LPASSWORD,
    payload: lPassword
  };
};

export const setCurrentUser = decoded => {
  return {
    type: types.SET_CURRENT_USER,
    payload: decoded
  };
};

export const handleRegister = (
  userName,
  school,
  location,
  email,
  password,
  password_confirm,
  callback
) => async dispatch => {
  try {
    const res = await axios({
      method: "post",
      url: "https://4de8e0fc.ngrok.io/api/auth/register",
      data: {
        userName,
        school,
        location,
        email,
        password,
        password_confirm,
        organizer: false
      }
    });

    const { token } = res.data;
    await AsyncStorage.setItem("jwtToken", token);
    const decoded = jwt_decode(token);
    dispatch(setCurrentUser(decoded));
    callback();
  } catch (e) {
    console.log(e);
  }
};

export const handleLogin = (email, password, callback) => async dispatch => {
  try {
    const res = await axios({
      method: "post",
      url: "https://4de8e0fc.ngrok.io/api/auth/login",
      data: { email, password }
    });

    const { token } = res.data;
    await AsyncStorage.setItem("jwtToken", token);
    const decoded = jwt_decode(token);
    dispatch(setCurrentUser(decoded));
    callback();
  } catch (e) {
    console.log(e);
  }
};

export const logoutUser = () => async dispatch => {
  await AsyncStorage.removeItem("jwtToken");
  dispatch(setCurrentUser({}));
};

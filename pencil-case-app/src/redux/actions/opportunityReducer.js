import * as types from "../types";
import { AsyncStorage } from "react-native";
import jwt_decode from "jwt-decode";
import axios from "axios";

export const getOpportunities = (
  email,
  password,
  callback
) => async dispatch => {
  try {
    const token = await AsyncStorage.getItem("jwtToken");
    axios.defaults.headers.common["Authorization"] = token;

    const { data } = await axios({
      method: "get",
      url: "https://4de8e0fc.ngrok.io/api/opportunity/getOpportunities"
    });

    dispatch({
      type: types.CHANGE_OPPORTUNITIES,
      payload: data.opportunities
    });
  } catch (e) {
    console.log(e);
  }
};

export const getMyOpportunities = (
  email,
  password,
  callback
) => async dispatch => {
  try {
    const token = await AsyncStorage.getItem("jwtToken");
    axios.defaults.headers.common["Authorization"] = token;

    const { data } = await axios({
      method: "get",
      url: "https://4de8e0fc.ngrok.io/api/opportunity/myOpportunities"
    });

    dispatch({
      type: types.CHANGE_MY_OPPORTUNITIES,
      payload: data.opportunities
    });
  } catch (e) {
    console.log(e);
  }
};

import * as types from "../types";

const INITIAL_STATE = {
  userName: "",
  school: "",
  location: "",
  email: "",
  password: "",
  password_confirm: "",
  lEmail: "",
  lPassword: "",
  isAuthenticated: false,
  user: {}
};

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case types.CHANGE_USER_NAME:
      return { ...state, userName: action.payload };

    case types.CHANGE_SCHOOL:
      return { ...state, school: action.payload };

    case types.CHANGE_LOCATION:
      return { ...state, location: action.payload };

    case types.CHANGE_EMAIL:
      return { ...state, email: action.payload };

    case types.CHANGE_PASSWORD:
      return { ...state, password: action.payload };

    case types.CHANGE_PASSWORD_CONFIRM:
      return { ...state, password_confirm: action.payload };

    case types.CHANGE_LEMAIL:
      return { ...state, lEmail: action.payload };

    case types.CHANGE_LPASSWORD:
      return { ...state, lPassword: action.payload };

    case types.SET_CURRENT_USER: {
      return {
        ...state,
        isAuthenticated: !(
          Object.keys(action.payload).length === 0 &&
          action.payload.constructor === Object
        ),
        user: action.payload
      };
    }

    default:
      return state;
  }
};

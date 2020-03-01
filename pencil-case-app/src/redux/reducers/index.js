import { combineReducers } from "redux";
import auth from "./authReducer";
import opportunity from "./opportunityReducer";

export default combineReducers({
  auth,
  opportunity
});

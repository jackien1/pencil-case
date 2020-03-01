import * as types from "../types";

const INITIAL_STATE = {
  opportunities: [],
  myOpportunities: []
};

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case types.CHANGE_OPPORTUNITIES:
      return { ...state, opportunities: action.payload };

    case types.CHANGE_MY_OPPORTUNITIES:
      return { ...state, myOpportunities: action.payload };

    default:
      return state;
  }
};

import Axios from "axios";

import{
    LOGIN_USER,
    REGISTER_USER
}from'./types';
export function loginUser(dataToSubmit) {
  const request = Axios.post("/api/user/login", dataToSubmit)
  .then(response => response.data
  )

  return{
      type:LOGIN_USER,
      payload: request //id
  }
}
export function registerUser(dataToSubmit) {
  const request = Axios.post("/api/users/register", dataToSubmit)
  .then(response => response.data
  )

  return{
      type:REGISTER_USER,
      payload: request //id
  }
}

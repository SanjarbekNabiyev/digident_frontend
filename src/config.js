import axios from 'axios';
const v1 = axios.create()

v1.defaults.baseURL = 'https://middleware.bdm.uz/api/v1/admin-app/api-bot'

v1.interceptors.request.use(function (config) {
    return config;
  }, function (error) {
    return Promise.reject(error);
});

v1.interceptors.response.use(function (response) {
  if(response?.data?.error == true) {
    return Promise.reject(response.data)
  } else {
    return response;
  }
}, function (error) {
  return Promise.reject(error);
});

export {v1}
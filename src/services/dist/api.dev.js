"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _axios = _interopRequireDefault(require("axios"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

// src/services/api.js
var api = _axios["default"].create({
  baseURL: process.env.REACT_APP_API_URL // Adjust to your backend URL

});

api.interceptors.request.use(function (config) {
  var token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = "Bearer ".concat(token);
  }

  return config;
});
var _default = api;
exports["default"] = _default;
"use strict";
// ES6 import statements
import Cryptr from "cryptr";
import Bcrypt from "bcryptjs";


const logger = (TAG, msg) => {
  console.log(`${TAG}: ${msg}`);
};

const getEncrypt = (value) => {
  const cryptr = new Cryptr(process.env.CRYPTR_KEY); //Server Secret Key
  return cryptr.encrypt(value);
};

const getDecrypt = (value) => {
  console.log("new decrypt: ", value);
  const cryptr = new Cryptr(process.env.CRYPTR_KEY); //Server Secret Key
  return cryptr.decrypt(value);
};

const getHashPassword = (value) => {
  return Bcrypt.hashSync(value, 8); //8=saltRounds
};

const isCompared = (value, testValue) => {
  return Bcrypt.compareSync(testValue, value); //8=saltRounds and returns true or false
};

export { logger, isCompared, getDecrypt, getEncrypt, getHashPassword };

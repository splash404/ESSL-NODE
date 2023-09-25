"use strict";
import sql from "mssql";
import { logger } from "./commonRepo.js";
import { ResponseModel } from "../models/responseObj.js";
import dotenv from "dotenv";
dotenv.config();

const config = {
  user: process.env.DB_USER_TEST,
  password: process.env.DB_PASSWORD_TEST,
  server: "localhost",
  database: process.env.DB_NAME,
  options: {
    encrypt: false, // You may need to change this based on your SQL Server configuration
  },
};

const dbHandler = async (query) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query(query);
    sql.close();
    return new ResponseModel(true, "Success", result.recordset);
  } catch (err) {
    logger("ERROR DB", err.message);
    throw new ResponseModel(false, err.message, undefined);
  }
};

const query = async (query) => {
  try {
    return await dbHandler(query);
  } catch (e) {
    throw e;
  }
};

const insert = async (table, insertData) => {
  const keys = Object.keys(insertData);
  const keyList = keys.join(",");
  const values = keys.map((key) => {
    if (typeof insertData[key] === "string") {
      return `'${insertData[key].replace(/'/g, "''")}'`;
    } else {
      return insertData[key];
    }
  });
  try {
    const query = `INSERT INTO ${table} (${keyList}) VALUES (${values.join(",")})`;
    return await dbHandler(query);
  } catch (e) {
    throw e;
  }
};

const insertMultiple = async (table, insertData) => {
  if (!Array.isArray(insertData)) {
    return new ResponseModel(false, "Invalid array to insert", undefined);
  }

  const keyList = Object.keys(insertData[0]);
  const keyListStr = keyList.join(",");
  const values = insertData.map((item) => {
    const valueList = keyList.map((key) => {
      if (typeof item[key] === "string") {
        return `'${item[key].replace(/'/g, "''")}'`;
      } else {
        return item[key];
      }
    });
    return `(${valueList.join(",")})`;
  });

  try {
    const query = `INSERT INTO ${table} (${keyListStr}) VALUES ${values.join(",")}`;
    return await dbHandler(query);
  } catch (e) {
    throw e;
  }
};

const updateQuery = async (table, updateData, whereData) => {
  const updatePairs = Object.keys(updateData).map((key) => {
    if (typeof updateData[key] === "string") {
      return `${key}='${updateData[key].replace(/'/g, "''")}'`;
    } else {
      return `${key}=${updateData[key]}`;
    }
  });

  const wherePairs = Object.keys(whereData).map((key) => {
    if (typeof whereData[key] === "string") {
      return `${key}='${whereData[key]}'`;
    } else {
      return `${key}=${whereData[key]}`;
    }
  });

  try {
    const updateString = updatePairs.join(",");
    const whereString = wherePairs.join(" AND ");
    const query = `UPDATE ${table} SET ${updateString} WHERE ${whereString}`;
    return await dbHandler(query);
  } catch (e) {
    throw e;
  }
};

export { query, insert, insertMultiple, updateQuery };

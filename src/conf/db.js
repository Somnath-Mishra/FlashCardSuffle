import mysql from 'mysql2/promise';
import conf from './conf.js';

export const db = mysql.createPool({
    host: conf.mysqlHost,
    user: conf.mysqlUser,
    password: conf.mysqlPassword,
    database: conf.mysqlDatabase,
});
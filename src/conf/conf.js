export const conf = {
    mysqlHost: String(process.env.MYSQL_HOST),
    mysqlUser: String(process.env.MYSQL_USER),
    mysqlPassword: String(process.env.MYSQL_PASSWORD),
    mysqlDatabase: String(process.env.MYSQL_DATABASE),
    serverPort: Number(process.env.SERVER_PORT),
    dataBaseUrl: String(process.env.DATABASE_URL),
    accessTokenSecret: String(process.env.ACCESS_TOKEN_SECRET),
    accessTokenExpiry: String(process.env.ACCESS_TOKEN_EXPIRY),
    refreshTokenSecret: String(process.env.REFRESH_TOKEN_SECRET),
    refreshTokenExpiry: String(process.env.REFRESH_TOKEN_EXPIRY),
};
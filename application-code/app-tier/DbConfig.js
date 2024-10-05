// DbConfig.js

module.exports = {
    DB_HOST: process.env.DB_HOST || 'localhost',
    DB_USER: process.env.DB_USER || 'root',
    DB_PWD: process.env.DB_PASSWORD || '',
    DB_DATABASE: process.env.DB_NAME || 'STUDENTS'
};

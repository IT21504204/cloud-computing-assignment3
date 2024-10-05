const dbcreds = require('./DbConfig');
const mysql = require('mysql');

// Establish MySQL connection
const con = mysql.createConnection({
    host: dbcreds.DB_HOST,
    user: dbcreds.DB_USER,
    password: dbcreds.DB_PWD,
    database: dbcreds.DB_DATABASE
});

// Ensure table is created if it doesn't exist
con.connect(function (err) {
    if (err) throw err;
    console.log("Connected to the database!");

    // Create table if it doesn't exist
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS transactions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            amount DECIMAL(10, 2) NOT NULL,
            description VARCHAR(255) NOT NULL
        );
    `;
    con.query(createTableQuery, function (err, result) {
        if (err) throw err;
        console.log("Transactions table is ready or already exists.");
    });
});

// Functions for transactions

/**
 * Adds a new transaction to the database.
 * @param {string | number} amount - The amount of the transaction.
 * @param {string} desc - The description of the transaction.
 * @returns {number} - Status code (200 for success, 400 for failure).
 */
function addTransaction(amount, desc) {
    // Convert amount to a valid decimal number
    const parsedAmount = parseFloat(amount);

    // Check if the parsedAmount is a valid number
    if (isNaN(parsedAmount)) {
        console.error("Invalid amount value: must be a number");
        return 400;  // Bad Request
    }

    // Check if description is valid
    if (typeof desc !== 'string' || desc.trim().length === 0) {
        console.error("Invalid description value: must be a non-empty string");
        return 400;  // Bad Request
    }

    // Prepare the SQL query using placeholders
    const mysqlQuery = `INSERT INTO transactions (amount, description) VALUES (?, ?)`;
    con.query(mysqlQuery, [parsedAmount, desc], function (err, result) {
        if (err) throw err;
        console.log("Added transaction to the table.");
    });
    return 200;  // Success
}

/**
 * Retrieves all transactions from the database.
 * @param {function} callback - Callback to handle the result.
 */
function getAllTransactions(callback) {
    const mysqlQuery = "SELECT * FROM transactions";
    con.query(mysqlQuery, function (err, result) {
        if (err) throw err;
        console.log("Getting all transactions...");
        return callback(result);
    });
}

/**
 * Finds a transaction by ID.
 * @param {number} id - The ID of the transaction.
 * @param {function} callback - Callback to handle the result.
 */
function findTransactionById(id, callback) {
    const mysqlQuery = `SELECT * FROM transactions WHERE id = ?`;
    con.query(mysqlQuery, [id], function (err, result) {
        if (err) throw err;
        console.log(`Retrieved transaction with ID ${id}`);
        return callback(result);
    });
}

/**
* Updates a transaction by ID.
* @param {number} id - The ID of the transaction to update.
* @param {string | number} amount - The updated amount of the transaction.
* @param {string} desc - The updated description of the transaction.
* @param {function} callback - Callback to handle the result.
*/
function updateTransactionById(id, amount, desc, callback) {
    // Convert amount to a valid decimal number
    const parsedAmount = parseFloat(amount);

    // Check if the parsedAmount is a valid number
    if (isNaN(parsedAmount)) {
        console.error("Invalid amount value: must be a number");
        return 400;  // Bad Request
    }

    // Prepare the SQL query using placeholders
    const mysqlQuery = `UPDATE transactions SET amount = ?, description = ? WHERE id = ?`;
    con.query(mysqlQuery, [parsedAmount, desc, id], function (err, result) {
        if (err) throw err;
        console.log(`Updated transaction with ID ${id}`);
        return callback(result);
    });
}

/**
 * Deletes a transaction by ID.
 * @param {number} id - The ID of the transaction to delete.
 * @param {function} callback - Callback to handle the result.
 */
function deleteTransactionById(id, callback) {
    const mysqlQuery = `DELETE FROM transactions WHERE id = ?`;
    con.query(mysqlQuery, [id], function (err, result) {
        if (err) throw err;
        console.log(`Deleted transaction with ID ${id}`);
        return callback(result);
    });
}


/**
 * Deletes all transactions from the database.
 * @param {function} callback - Callback to handle the result.
 */
function deleteAllTransactions(callback) {
    const mysqlQuery = "DELETE FROM transactions";
    con.query(mysqlQuery, function (err, result) {
        if (err) throw err;
        console.log("Deleted all transactions.");
        return callback(result);
    });
}

/**
 * Deletes a transaction by ID.
 * @param {number} id - The ID of the transaction to delete.
 * @param {function} callback - Callback to handle the result.
 */
function deleteTransactionById(id, callback) {
    const mysqlQuery = `DELETE FROM transactions WHERE id = ?`;
    con.query(mysqlQuery, [id], function (err, result) {
        if (err) throw err;
        console.log(`Deleted transaction with ID ${id}`);
        return callback(result);
    });
}

// Export the functions
module.exports = {
    addTransaction,
    getAllTransactions,
    deleteAllTransactions,
    findTransactionById,
    deleteTransactionById,
    updateTransactionById
};


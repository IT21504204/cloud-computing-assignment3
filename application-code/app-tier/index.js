const transactionService = require('./TransactionService');  // Ensure you're importing the service
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const port = 4000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

let loadRunning = false;

// ROUTES FOR OUR API
// =======================================================

// Health Checking
app.get('/health', (req, res) => {
    res.json("This is the health check");
});

// ADD TRANSACTION
app.post('/transaction', (req, res) => {
    try {
        console.log(req.body);
        const success = transactionService.addTransaction(req.body.amount, req.body.desc);
        if (success === 200) {
            res.json({ message: 'Added transaction successfully' });
        } else {
            res.status(400).json({ message: 'Invalid input' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Something went wrong', error: err.message });
    }
});

// GET ALL TRANSACTIONS
app.get('/transaction', (req, res) => {
    try {
        transactionService.getAllTransactions(function (results) {
            const transactionList = results.map(row => ({
                id: row.id,
                amount: row.amount,
                description: row.description
            }));
            res.status(200).json({ result: transactionList });
        });
    } catch (err) {
        res.status(500).json({ message: "Could not get all transactions", error: err.message });
    }
});

// DELETE ALL TRANSACTIONS
app.delete('/transaction', (req, res) => {
    try {
        transactionService.deleteAllTransactions(function (result) {
            res.status(200).json({ message: "All transactions deleted successfully." });
        });
    } catch (err) {
        res.status(500).json({ message: "Deleting all transactions may have failed.", error: err.message });
    }
});

// DELETE ONE TRANSACTION BY ID
app.delete('/transaction/:id', (req, res) => {
    const id = req.params.id;
    try {
        transactionService.deleteTransactionById(id, function (result) {
            res.status(200).json({ message: `Transaction with ID ${id} deleted successfully.` });
        });
    } catch (err) {
        res.status(500).json({ message: "Error deleting transaction", error: err.message });
    }
});

// GET SINGLE TRANSACTION BY ID
app.get('/transaction/:id', (req, res) => {
    const id = req.params.id;
    try {
        transactionService.findTransactionById(id, function (result) {
            if (result.length === 0) {
                res.status(404).json({ message: "Transaction not found" });
            } else {
                const transaction = {
                    id: result[0].id,
                    amount: result[0].amount,
                    description: result[0].description
                };
                res.status(200).json(transaction);
            }
        });
    } catch (err) {
        res.status(500).json({ message: "Error retrieving transaction", error: err.message });
    }
});

// UPDATE TRANSACTION BY ID
app.put('/transaction/:id', (req, res) => {
    const id = req.params.id;
    const { amount, desc } = req.body;

    try {
        transactionService.updateTransactionById(id, amount, desc, (result) => {
            res.status(200).send({ message: 'Transaction updated successfully' });
        });
    } catch (err) {
        res.status(500).json({ message: "Error updating transaction", error: err.message });
    }
});

// DELETE TRANSACTION BY ID
app.delete('/transaction/:id', (req, res) => {
    const id = req.params.id;

    try {
        transactionService.deleteTransactionById(id, (result) => {
            res.status(200).send({ message: 'Transaction deleted successfully' });
        });
    } catch (err) {
        res.status(500).json({ message: "Error deleting transaction", error: err.message });
    }
});


app.get('/instance-id', async (req, res) => {
    try {
        // Fetch the token
        const tokenResponse = await fetch('http://169.254.169.254/latest/api/token', {
            method: 'PUT',
            headers: { 'X-aws-ec2-metadata-token-ttl-seconds': '21600' }
        });

        const token = await tokenResponse.text();

        // Fetch the instance ID using the token
        const instanceIdResponse = await fetch('http://169.254.169.254/latest/meta-data/instance-id', {
            headers: { 'X-aws-ec2-metadata-token': token }
        });

        const instanceId = await instanceIdResponse.text();

        // Respond with the instance ID
        res.json({ instanceId });
    } catch (error) {
        // Handle any errors
        res.status(500).json({ error: 'Not running in EC2 or unable to fetch instance ID' });
    }
});

// Simulate a CPU load test
function simulateCpuLoad() {
    const startTime = Date.now();
    while (loadRunning) {
        // Perform a CPU-intensive task for about 1 second
        if (Date.now() - startTime > 1000) {
            break;
        }
        for (let i = 0; i < 1e7; i++) { }  // Busy loop
    }
}

// Start the CPU load test
app.get('/load-test', (req, res) => {
    loadRunning = true;

    // Perform CPU load in a non-blocking manner
    const loadInterval = setInterval(() => {
        if (!loadRunning) {
            clearInterval(loadInterval);
        }
        simulateCpuLoad();
    }, 1000);  // Repeat every 1 second

    // Return some mock CPU/memory stats (you could also use `os` module to get real stats)
    res.json({
        cpuUsage: Math.random() * 100,  // Fake CPU usage value for demonstration
        memoryUsage: Math.random() * 100  // Fake memory usage value for demonstration
    });
});

// Stop the CPU load test
app.post('/stop-load-test', (req, res) => {
    loadRunning = false;
    res.json({ message: 'Load test stopped successfully' });
});

// Start the server
app.listen(port, () => {
    console.log(`AB3 backend app listening at http://localhost:${port}`);
});

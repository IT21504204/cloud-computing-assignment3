import React, { Component } from 'react';
import './DatabaseDemo.css'; // Retain your existing CSS

class DatabaseDemo extends Component {
    constructor(props) {
        super(props);
        this.handleTextChange = this.handleTextChange.bind(this);
        this.handleButtonClick = this.handleButtonClick.bind(this);
        this.handleButtonClickDel = this.handleButtonClickDel.bind(this);
        this.state = {
            transactions: [],
            text_amt: "",
            text_desc: "",
            edit_id: null, // Track which transaction is being edited
        };
    }

    componentDidMount() {
        this.populateData();
    }

    // Fetch all transactions
    populateData() {
        this.fetch_retry('/api/transaction', 3)
            .then((res) => res.json())
            .then((data) => {
                this.setState({ transactions: data.result });
            })
            .catch(console.log);
    }

    async fetch_retry(url, n) {
        try {
            return await fetch(url);
        } catch (err) {
            if (n === 1) throw err;
            await new Promise((resolve) => setTimeout(resolve, 1000));
            return await this.fetch_retry(url, n - 1);
        }
    }

    // Render the transaction table
    renderTableData() {
        return this.state.transactions.map((transaction) => {
            const { id, amount, description } = transaction;
            const isEditing = this.state.edit_id === id;
            return (
                <tr key={id}>
                    <td>{id}</td>
                    <td>
                        {isEditing ? (
                            <input
                                type="text"
                                name="text_amt"
                                value={this.state.text_amt}
                                onChange={this.handleTextChange}
                            />
                        ) : (
                            amount
                        )}
                    </td>
                    <td>
                        {isEditing ? (
                            <input
                                type="text"
                                name="text_desc"
                                value={this.state.text_desc}
                                onChange={this.handleTextChange}
                            />
                        ) : (
                            description
                        )}
                    </td>
                    <td>
                        {isEditing ? (
                            <button onClick={() => this.handleUpdateClick(id)}>Save</button>
                        ) : (
                            <button onClick={() => this.startEdit(transaction)}>Edit</button>
                        )}
                        <button onClick={() => this.handleDeleteClick(id)}>Delete</button>
                    </td>
                </tr>
            );
        });
    }

    // Start editing a transaction
    startEdit(transaction) {
        this.setState({
            edit_id: transaction.id,
            text_amt: transaction.amount,
            text_desc: transaction.description,
        });
    }

    // Handle updating a transaction
    handleUpdateClick(id) {
        const requestOptions = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amount: this.state.text_amt,
                desc: this.state.text_desc,
            }),
        };

        fetch(`/api/transaction/${id}`, requestOptions)
            .then((response) => response.json())
            .then((data) => this.populateData())
            .catch(console.log);

        this.setState({
            edit_id: null,
            text_amt: "",
            text_desc: "",
        });
    }

    // Handle deleting a transaction
    handleDeleteClick(id) {
        const requestOptions = {
            method: 'DELETE',
        };

        fetch(`/api/transaction/${id}`, requestOptions)
            .then((response) => response.json())
            .then((data) => this.populateData())
            .catch(console.log);
    }

    // Handle deleting all transactions
    handleButtonClickDel() {
        const requestOptions = {
            method: 'DELETE',
        };

        fetch('/api/transaction', requestOptions)
            .then((response) => response.json())
            .then((data) => this.populateData())
            .catch(console.log);

        this.setState({ text_amt: "", text_desc: "", transactions: [] });
    }

    // Handle adding a new transaction
    handleButtonClick() {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amount: this.state.text_amt,
                desc: this.state.text_desc,
            }),
        };

        fetch('/api/transaction', requestOptions)
            .then((response) => response.json())
            .then((data) => this.populateData())
            .catch(console.log);

        this.setState({ text_amt: "", text_desc: "" });
    }

    handleTextChange(e) {
        this.setState({ [e.target.name]: e.target.value });
    }

    render() {
        return (
            <div>
                <h1 id="title" style={{ paddingRight: '1em' }}>
                    School Admission System
                </h1>
                <input
                    style={{ float: 'right', marginBottom: '1em' }}
                    type="button"
                    value="DELETE ALL"
                    onClick={this.handleButtonClickDel}
                />
                <table id="transactions">
                    <tbody>
                        <tr>
                            <td>ID</td>
                            <td>Student Number</td>
                            <td>Student Name</td>
                            <td>ACTIONS</td>
                        </tr>
                        <tr>
                            <td>
                                <input type="button" value="ADD" onClick={this.handleButtonClick} />
                            </td>
                            <td>
                                <input
                                    type="text"
                                    name="text_amt"
                                    value={this.state.text_amt}
                                    onChange={this.handleTextChange}
                                />
                            </td>
                            <td>
                                <input
                                    type="text"
                                    name="text_desc"
                                    value={this.state.text_desc}
                                    onChange={this.handleTextChange}
                                />
                            </td>
                        </tr>
                        {this.renderTableData()}
                    </tbody>
                </table>
            </div>
        );
    }
}

export default DatabaseDemo;

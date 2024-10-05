import React, { Component } from 'react';

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      instanceId: null,
      cpuLoadRunning: false,
      cpuUsage: null,
      memoryUsage: null,
      errorMessage: null,
    };
    this.fetchInstanceId = this.fetchInstanceId.bind(this);
    this.startLoadTest = this.startLoadTest.bind(this);
    this.stopLoadTest = this.stopLoadTest.bind(this);
  }

  componentDidMount() {
    this.fetchInstanceId();
  }

  // Fetch EC2 instance ID or show not running in EC2
  async fetchInstanceId() {
    try {
      const response = await fetch('/api/instance-id');
      const data = await response.json();
      this.setState({ instanceId: data.instanceId });
    } catch (error) {
      this.setState({ errorMessage: 'Not running in EC2 or could not fetch instance ID' });
    }
  }

  // Start load test
  startLoadTest() {
    this.setState({ cpuLoadRunning: true });
    this.loadTestInterval = setInterval(() => {
      fetch('/api/load-test')
        .then(res => res.json())
        .then(data => {
          this.setState({
            cpuUsage: data.cpuUsage,
            memoryUsage: data.memoryUsage,
          });
        });
    }, 1000);
  }

  // Stop load test
  stopLoadTest() {
    clearInterval(this.loadTestInterval);
    this.setState({ cpuLoadRunning: false });

    // Send stop request to backend
    fetch('/api/stop-load-test', {
      method: 'POST',
    })
      .then(response => response.json())
      .then(data => {
        console.log(data.message);  // Output success message from backend
      })
      .catch(err => {
        console.error('Failed to stop load test:', err);
      });
  }

  render() {
    const { instanceId, cpuLoadRunning, cpuUsage, memoryUsage, errorMessage } = this.state;

    return (
      <div>
        <h1 style={{ color: "white" }}>Assignment 3 (IT21504204)</h1>

        <div style={{ color: 'white', marginTop: '20px' }}>
          <h2>Instance ID:</h2>
          {instanceId ? <p>{instanceId}</p> : <p>{errorMessage}</p>}
        </div>

        <div style={{ color: 'white', marginTop: '20px' }}>
          <h2>Load Test:</h2>
          {cpuLoadRunning ? (
            <>
              <p>CPU Usage: {cpuUsage ? `${cpuUsage}%` : 'Loading...'}</p>
              <p>Memory Usage: {memoryUsage ? `${memoryUsage}%` : 'Loading...'}</p>
              <button onClick={this.stopLoadTest}>Stop Load Test</button>
            </>
          ) : (
            <button onClick={this.startLoadTest}>Start Load Test</button>
          )}
        </div>
      </div>
    );
  }
}

export default Home;

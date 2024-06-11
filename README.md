# Node.js Event Loop Simulation in JavaScript

## Introduction

This repository, `nodejs-eventloop-simulation`, contains an implementation of a custom event loop in JavaScript, designed for educational purposes to understand how event loops work under the hood. This event loop manages timers and intervals using a min-heap data structure.

## Features

- **Custom Event Loop**: Manages asynchronous callbacks with `setTimeout` and `setInterval` functionalities.
- **Timer Management**: Uses a min-heap to efficiently manage timers.
- **Promise Integration**: Demonstrates usage of the event loop with custom promises.

## Getting Started

### Prerequisites

- Node.js
- `heap` package: Install using `npm install heap`
- Custom `Promise` module: Ensure it is available in your project.

### Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/souparno/nodejs-eventloop-simulation.git
    cd nodejs-eventloop-simulation
    ```
2. Install dependencies:
    ```bash
    npm install heap
    ```

## Usage

1. Create an instance of the `EventLoop` class:
    ```javascript
    const EventLoop = require('./EventLoop'); // Adjust the path as needed
    const eventLoop = new EventLoop();
    ```
2. Start the event loop:
    ```javascript
    eventLoop.start();
    ```
3. Use `setInterval` and `setTimeout` to schedule tasks:
    ```javascript
    const intervalId = eventLoop.setInterval(() => {
        console.log("Interval callback");
    }, 1000);

    const timeoutId = eventLoop.setTimeout(() => {
        console.log("Timeout callback");
    }, 2000);
    ```
4. Use custom promises with the event loop:
    ```javascript
    function fetchDataAsync() {
        return new Promise((resolve, reject) => {
            eventLoop.setTimeout(() => {
                const data = { message: "Data fetched successfully" };
                resolve(data);
            }, 5000);
        });
    }

    function processDataAsync() {
        return new Promise((resolve, reject) => {
            eventLoop.setTimeout(() => {
                const data = { message: "Data processed successfully" };
                resolve(data);
            }, 2000);
        });
    }

    fetchDataAsync()
        .then(data => {
            console.log("Success:", data);
            return processDataAsync();
        })
        .then(data => {
            console.log("Success:", data);
        })
        .catch(error => {
            console.error("Error:", error);
        });
    ```
5. Stop the event loop if needed:
    ```javascript
    eventLoop.stop();
    ```

## Example

Refer to the `eventLoop.js` file for examples of using the custom event loop.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request or open an issue.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

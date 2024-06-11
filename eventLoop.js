const Heap = require('heap');
const Promise = require('./Promise');

class EventLoop {
    constructor() {
        this.timerHeap = new Heap((a, b) => a.time - b.time);
        this.intervals = new Map();
        this.timeouts = new Map();
        this.running = false;
        this.nextIntervalId = 1;
        this.nextTimeoutId = 1;
    }

    start() {
        this.running = true;
        this.runLoop();
    }

    stop() {
        this.running = false;
    }

    runLoop() {
        while (this.running) {
            const now = Date.now();

            // Timers Phase
            while (!this.timerHeap.empty() && this.timerHeap.peek().time <= now) {
                const timer = this.timerHeap.pop();
                timer.callback();
                // If the timer is an interval timer, reschedule it
                if (timer.intervalId) {
                    this.rescheduleInterval(timer.intervalId, timer.interval);
                }
            }
        }
    }

    setTimeout(callback, delay) {
        if (typeof callback !== 'function' || delay < 0) {
            throw new Error('Invalid callback or delay');
        }
        const time = Date.now() + delay;
        const timer = { callback, time, timeoutId: this.nextTimeoutId++ };
        this.timerHeap.push(timer);
        this.timeouts.set(timer.timeoutId, timer);
        return timer.timeoutId;
    }

    clearTimeout(timeoutId) {
        this.timeouts.delete(timeoutId);
    }

    setInterval(callback, interval) {
        if (typeof callback !== 'function' || interval <= 0) {
            throw new Error('Invalid callback or interval');
        }
        const intervalId = this.nextIntervalId++;
        const intervalTimer = { callback, time: Date.now() + interval, interval, intervalId };
        this.intervals.set(intervalId, intervalTimer);
        this.timerHeap.push(intervalTimer);
        return intervalId;
    }

    clearInterval(intervalId) {
        this.intervals.delete(intervalId);
    }

    rescheduleInterval(intervalId, interval) {
        const intervalTimer = this.intervals.get(intervalId);
        if (intervalTimer) {
            intervalTimer.time = Date.now() + interval; // Adjusted to prevent drift
            this.timerHeap.push(intervalTimer);
        }
    }
}

// Example usage:
const eventLoop = new EventLoop();

// Example 1: Using setInterval and clearInterval
const intervalId = eventLoop.setInterval(() => {
    console.log("Interval callback");
}, 1000);

// eventLoop.setTimeout(() => {
//     eventLoop.clearInterval(intervalId);
// }, 5000);

// Example 2: Using setTimeout and clearTimeout
const timeoutId = eventLoop.setTimeout(() => {
    console.log("Timeout callback");
}, 2000);

// eventLoop.setTimeout(() => {
//     eventLoop.clearTimeout(timeoutId);
// }, 1000);

// Example 3: Using a custom promise with setTimeout
function fetchDataAsync() {
    return new Promise((resolve, reject) => {
        eventLoop.setTimeout(() => {
            const data = { message: "Data fetched successfully" };
            resolve(data);
        }, 5000); // Simulate 5 seconds delay for fetching data
    });
}

function processDataAsync() {
    return new Promise((resolve, reject) => {
        eventLoop.setTimeout(() => {
            const data = { message: "Data processed successfully" };
            resolve(data);
        }, 2000); // Simulate 2 seconds delay
    });
}

// Enqueue the async task and start the event loop
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


// Start the event loop
eventLoop.start();

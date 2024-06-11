class Promise {
    constructor(executor) {
        this.state = 'pending'; // 'pending', 'fulfilled', or 'rejected'
        this.value = undefined;
        this.reason = undefined;
        this.onFulfilledCallbacks = [];
        this.onRejectedCallbacks = [];

        const resolve = (value) => {
            if (this.state === 'pending') {
                this.state = 'fulfilled';
                this.value = value;
                this.onFulfilledCallbacks.forEach(callback => callback(this.value));
            }
        };

        const reject = (reason) => {
            if (this.state === 'pending') {
                this.state = 'rejected';
                this.reason = reason;
                this.onRejectedCallbacks.forEach(callback => callback(this.reason));
            }
        };

        try {
            executor(resolve, reject);
        } catch (error) {
            reject(error);
        }
    }

    then(onFulfilled, onRejected) {
        return new Promise((resolve, reject) => {
            const resolvePromise = (callback, value) => {
                try {
                    const result = callback ? callback(value) : value;
                    if (result instanceof Promise) {
                        result.then(resolve, reject);
                    } else {
                        resolve(result);
                    }
                } catch (error) {
                    reject(error);
                }
            };

            if (this.state === 'fulfilled') {
                resolvePromise(onFulfilled, this.value);
            } else if (this.state === 'rejected') {
                resolvePromise(onRejected, this.reason);
            } else if (this.state === 'pending') {
                this.onFulfilledCallbacks.push((value) => {
                    resolvePromise(onFulfilled, value);
                });
                this.onRejectedCallbacks.push((reason) => {
                    resolvePromise(onRejected, reason);
                });
            }
        });
    }

    catch(onRejected) {
        return this.then(null, onRejected);
    }

    finally(onFinally) {
        return this.then(
            value => {
                onFinally();
                return value;
            },
            reason => {
                onFinally();
                throw reason;
            }
        );
    }

    static resolve(value) {
        return new Promise((resolve) => resolve(value));
    }

    static reject(reason) {
        return new Promise((_, reject) => reject(reason));
    }
}

// Export the Promise class
module.exports = Promise;

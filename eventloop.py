import os
import socket
import select
import time
from heapq import heappush, heappop

class EventLoop:
    def __init__(self):
        self.readers = {}  # Sockets with associated callbacks for read events
        self.timer_heap = []  # Min-heap for managing timer events
        self.running = False
        self.wakeup_read, self.wakeup_write = os.pipe()  # Pipe for waking up the loop

    def start(self):
        self.running = True
        self.run_loop()

    def stop(self):
        self.running = False
        self._wakeup()

    def run_loop(self):
        while self.running:
            # Calculate the timeout for the next scheduled timer event
            timeout = self._calculate_timeout()
            
            # I/O Events Phase: Wait for I/O events or timeout using select
            readable, _, _ = select.select(list(self.readers.keys()) + [self.wakeup_read], [], [], timeout)
            
            if self.wakeup_read in readable:
                # Clear the wakeup signal if wakeup pipe is ready
                os.read(self.wakeup_read, 1)
            
            # Handle I/O events
            self._process_ready(readable)
            
            # Timers Phase: Handle due timer events
            self._process_timers()

    def _wakeup(self):
        """Wake up the event loop if it is waiting in select."""
        os.write(self.wakeup_write, b'\x00')

    def _calculate_timeout(self):
        """Calculate the time in seconds until the next scheduled timer event."""
        if not self.timer_heap:
            return None
        now = time.time()
        next_time = self.timer_heap[0][0]
        return max(0, next_time - now)

    def _process_timers(self):
        """Process due timer events by calling their callbacks."""
        now = time.time()
        while self.timer_heap and self.timer_heap[0][0] <= now:
            _, callback = heappop(self.timer_heap)
            callback()

    def _process_ready(self, readable):
        """Process ready I/O events by calling their callbacks."""
        for sock in readable:
            if sock != self.wakeup_read and sock in self.readers:
                callback = self.readers[sock]
                callback()

    def add_reader(self, sock, callback):
        """Add a socket and its callback to the readers."""
        self.readers[sock] = callback
        self._wakeup()

    def remove_reader(self, sock):
        """Remove a socket from the readers."""
        if sock in self.readers:
            del self.readers[sock]
            self._wakeup()

    def set_timeout(self, callback, delay):
        """Schedule a one-time callback after a delay."""
        time_to_run = time.time() + delay
        heappush(self.timer_heap, (time_to_run, callback))
        self._wakeup()

    def set_interval(self, callback, interval):
        """Schedule a recurring callback with a specified interval."""
        def wrapper():
            callback()
            self.set_timeout(wrapper, interval)
        self.set_timeout(wrapper, interval)

# Example usage
def on_data_available():
    conn, addr = server_socket.accept()
    data = conn.recv(1024)
    print(f"Received data: {data.decode()}")
    conn.close()

def send_data_periodically():
    client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    client_socket.connect(('localhost', 12345))
    client_socket.sendall(b"Hello, World!")
    client_socket.close()

# Create a server socket
server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
server_socket.bind(('localhost', 12345))
server_socket.listen()

# Create an event loop
loop = EventLoop()
loop.add_reader(server_socket, on_data_available)

# Start sending data periodically using set_interval
loop.set_interval(send_data_periodically, 1)

# Run the event loop (no separate thread, single-threaded operation)
loop.start()

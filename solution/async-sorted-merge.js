'use strict';

const { Heap } = require('heap-js');

const DEBUG = process.env.DEBUG;

// Print all entries, across all of the *async* sources, in chronological order.

const drainHeap = ({ heap, maxDate, sizeThreshold = 5, printer }) => {
  // Break if heap size is under threshold
  if (heap.size() < sizeThreshold) return;
  // Debug log
  if (DEBUG) {
    console.log(
      `draining heap. size: ${heap.size()} maxDate: ${maxDate?.toISOString?.()} sizeThreshold: ${sizeThreshold}`
    );
  }
  let i = 0;
  // Print out all of the entries up to maxDate
  while (!heap.isEmpty() && (!maxDate || heap.peek()?.date <= maxDate)) {
    printer.print(heap.pop());
    i++;
  }
  // Debug log
  if (DEBUG) {
    console.log(`drained log messages: ${i}`);
  }
};

const processAsyncLogs = async (originalLogSources, printer) => {
  let logSources = [...originalLogSources];
  const heap = new Heap((a, b) => a.date.getTime() - b.date.getTime());

  while (logSources.length > 0) {
    let minDateInBatch = new Date();

    const batch = logSources.map((logSource) => logSource.popAsync());
    const entries = await Promise.allSettled(batch);

    entries.forEach(({ value: entry }) => {
      if (entry) {
        if (entry && entry.date < minDateInBatch) minDateInBatch = entry.date;
        heap.add(entry);
      }
    });

    // Clear empty log sources
    logSources = logSources.filter((logSource) => !logSource.drained);

    drainHeap({ heap, maxDate: minDateInBatch, sizeThreshold: 10, printer });
  }

  // Drain the rest of the heap
  drainHeap({ heap, maxDate: null, sizeThreshold: 0, printer });

  printer.done();
  return true;
};

module.exports = (logSources, printer) => {
  return new Promise((resolve, reject) => {
    processAsyncLogs(logSources, printer).then(() => {
      resolve(console.log('Async sort complete.'));
    });
  });
};

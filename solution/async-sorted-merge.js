'use strict';

const { Heap } = require('heap-js');
const drainHeap = require('./drain-heap');

const DEBUG = process.env.DEBUG;

// Print all entries, across all of the *async* sources, in chronological order.
const processAsyncLogs = async (originalLogSources, printer) => {
  let logSources = [...originalLogSources],
    maxHeapSize = 0;
  const heap = new Heap((a, b) => a.date.getTime() - b.date.getTime());

  while (logSources.length > 0) {
    let minDateInBatch = new Date();

    const batch = logSources.map((logSource) => logSource.popAsync());
    const entries = await Promise.allSettled(batch);

    // Iterate over log sources, clearing empty ones along the way
    logSources = logSources.filter((logSource, i) => {
      // Filter out empty log sources
      if (logSource.drained) {
        return false;
      }

      // Process next entry
      const entry = entries[i]?.value;
      if (entry) {
        // Keep track of the oldest log in the batch to drain the heap more efficiently
        if (entry && entry.date < minDateInBatch) minDateInBatch = entry.date;
        // Add entry to the heap
        heap.add(entry);
      }

      return true;
    });

    if (heap.size() > maxHeapSize) {
      maxHeapSize = heap.size();
    }

    drainHeap({ heap, maxDate: minDateInBatch, sizeThreshold: 10, printer });
  }

  // Drain the rest of the heap
  drainHeap({ heap, maxDate: null, sizeThreshold: 0, printer });

  printer.done();
  console.log(`Max heap size (async): ${maxHeapSize}`);
  return true;
};

module.exports = (logSources, printer) => {
  return new Promise((resolve, reject) => {
    processAsyncLogs(logSources, printer).then(() => {
      resolve(console.log('Async sort complete.'));
    });
  });
};

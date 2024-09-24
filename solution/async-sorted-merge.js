'use strict';

const { Heap } = require('heap-js');
const drainHeap = require('./drain-heap');

const DEBUG = process.env.DEBUG;

// Print all entries, across all of the *async* sources, in chronological order.
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

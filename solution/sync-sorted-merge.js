'use strict';
const { Heap } = require('heap-js');
const drainHeap = require('./drain-heap');

const DEBUG = process.env.DEBUG;

// Print all entries, across all of the sources, in chronological order.
module.exports = (originalLogSources, printer) => {
  let logSources = [...originalLogSources],
    maxHeapSize = 0;
  const heap = new Heap((a, b) => a.date.getTime() - b.date.getTime());

  while (logSources.length > 0) {
    let minDateInBatch = new Date();
    for (let i = 0; i < logSources.length; i++) {
      const logSource = logSources[i];
      const entry = logSource.pop();
      if (entry) {
        if (entry && entry.date < minDateInBatch) minDateInBatch = entry.date;
        heap.add(entry);
      }
    }

    // Clear empty log sources
    logSources = logSources.filter((logSource) => !logSource.drained);

    if (heap.size() > maxHeapSize) {
      maxHeapSize = heap.size();
    }

    drainHeap({ heap, maxDate: minDateInBatch, sizeThreshold: 10, printer });
  }

  // Drain the rest of the heap
  drainHeap({ heap, maxDate: null, sizeThreshold: 0, printer });

  printer.done();
  console.log(`Max heap size (sync): ${maxHeapSize}`);
  return console.log('Sync sort complete.');
};

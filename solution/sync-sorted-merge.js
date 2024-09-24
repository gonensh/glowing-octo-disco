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

    // Iterate over log sources, clearing empty ones along the way
    logSources = logSources.filter((logSource) => {
      // Filter out empty log sources
      if (logSource.drained) {
        return false;
      }

      // Process next entry
      const entry = logSource.pop();
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
  console.log(`Max heap size (sync): ${maxHeapSize}`);
  return console.log('Sync sort complete.');
};

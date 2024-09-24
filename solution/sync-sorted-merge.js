'use strict';
const { Heap } = require('heap-js');

const DEBUG = process.env.DEBUG;

// Print all entries, across all of the sources, in chronological order.
module.exports = (originalLogSources, printer) => {
  let logSources = [...originalLogSources];
  const heap = new Heap((a, b) => a.date.getTime() - b.date.getTime());

  const drainHeap = (heap, maxDate, sizeThreshold = 5) => {
    // Break if heap size is under threshold
    if (heap.size() < sizeThreshold) return;
    // Debug log
    if (DEBUG)
      console.log(
        `draining heap. size: ${heap.size()} maxDate: ${maxDate?.toISOString?.()} sizeThreshold: ${sizeThreshold}`
      );
    let i = 0;
    // Print out all of the entries up to maxDate
    while (!heap.isEmpty() && (!maxDate || heap.peek()?.date <= maxDate)) {
      printer.print(heap.pop());
      i++;
    }
    // Debug log
    if (DEBUG) console.log(`${i} log messages drained`);
  };

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

    drainHeap(heap, minDateInBatch, 10);
  }

  // Drain the rest of the heap
  drainHeap(heap, null, 0);

  printer.done();
  return console.log('Sync sort complete.');
};

'use strict';

const { Heap } = require('heap-js');

// Print all entries, across all of the sources, in chronological order.
module.exports = (originalLogSources, printer) => {
  let logSources = [...originalLogSources];
  const heap = new Heap((a, b) => a.date.getTime() - b.date.getTime());

  const drainHeap = (heap, maxDate, sizeThreshold = 5) => {
    if (heap.size() < sizeThreshold) return;
    console.log(
      `draining heap. size: ${heap.size()} maxDate: ${maxDate} sizeThreshold: ${sizeThreshold}`
    );
    // Print out all of the entries up to maxDate
    let entry = heap.poll();
    while (
      !heap.isEmpty() &&
      entry?.date &&
      (!maxDate || entry.date <= maxDate)
    ) {
      printer.print(entry);
      entry = heap.poll();
    }
  };

  while (true) {
    if (logSources.length === 0) {
      drainHeap(heap, null, 0);
      printer.done();
      break;
    }

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

    drainHeap(heap, minDateInBatch);
  }

  return console.log('Sync sort complete.');
};

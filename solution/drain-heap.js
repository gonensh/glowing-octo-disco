const DEBUG = process.env.DEBUG;

module.exports = ({ heap, maxDate, sizeThreshold = 5, printer }) => {
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

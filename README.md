<img align="left" width="100px" height="100px" src="/assets/seso-eng-logo.png">

# Seso Engineering | Challenge: Log Sorting

# Solution by Gonen Shoham

## Usage

### Benchmark mode (recommended)

`npm run benchmark [number of log sources]`

- To simplify testing, you can use `npm run benchmark 1000` where 1000 is the number of log sources to be used.
- Benchmark mode will display stats while avoiding log output to stdout.
- Sample output:

```
Specified source count: 10000

Processing sync logs...

***********************************
Logs printed:            2397682
Time taken (s):          14.56
Logs/s:                  164675.961
***********************************

Max heap size (sync): 748807

Sync sort complete.

Processing async logs...

***********************************
Logs printed:            2392631
Time taken (s):          19.894
Logs/s:                  120268.975
***********************************

Max heap size (async): 767491

Async sort complete.
```

### Debug mode

`npm run debug [number of log sources]`

- To get granular logging at each log heap drain cycle, you can use `npm run debug`
- Debug mode will add verbose logging at each log heap drain cycle, giving you insights into the workings of the algorithms

### Standard mode

`npm start`

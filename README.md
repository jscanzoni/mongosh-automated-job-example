# MongoDB Script Example

## About

This repository contains a MongoDB script that performs the following tasks:
1. Connects to a MongoDB database.
2. Inserts five documents into a `source` collection with random integer values.
3. Creates an index on the `type` field.
4. Aggregates the sum of values by `type` and merges the results into a `destination` collection, using `type` as the `_id`.

## Script Explanation

The script `generate_and_sum.js` does the following:
- Connects to the MongoDB database using a specified connection string and namespace.
- Inserts five documents into the `source` collection. Each document has:
  - `_id`
  - `value`: A random integer between 1 and 10.
  - `type`: Either "even" or "odd" based on the value.
- Creates an index on the `type` field.
- Aggregates the sum of `value` for each `type` and merges the result into the `destination` collection, using `type` as `_id`.

## Running the Script

### One-Off Execution

To run the script manually, follow these steps:

1. Ensure you have `mongosh` installed.
2. Save the script as `generate_and_sum.js`.
3. Open your terminal.
4. Run the following command:

    ```sh
    mongosh --nodb --file generate_and_sum.js
    ```

### Scheduling with Cron

To schedule the script to run at regular intervals using cron, follow these steps:

1. Open your crontab file for editing:

    ```sh
    crontab -e
    ```

2. Add the following line to schedule the script. This example runs the script every day at midnight:

    ```sh
    0 0 * * * mongosh --nodb --file /path/to/generate_and_sum.js
    ```

    Replace `/path/to/generate_and_sum.js` with the actual path to your script.

## Script Contents

```javascript
// Connection string and namespace variables
const connectionString = 'mongodb://localhost:27017';
const namespace = 'mongosh_test';

// Connect to the database
const db = connect(`${connectionString}/${namespace}`);

// Insert five documents into the 'source' collection
for (let i = 0; i < 5; i++) {
  let value = Math.floor(Math.random() * 10) + 1;
  db.source.insertOne({
    value: value,
    type: value % 2 === 0 ? "even" : "odd"
  });
}

// Create an index on the 'type' field
db.source.createIndex({ type: 1 });

// Perform the aggregation and merge into 'destination' collection
db.source.aggregate([
  {
    $group: {
      _id: "$type",
      totalValue: { $sum: "$value" }
    }
  },
  {
    $project: {
      _id: 1,  // Use the type as the _id
      totalValue: 1
    }
  },
  {
    $merge: {
      into: "destination",
      on: "_id",  // Use the type as the _id in destination
      whenMatched: "merge",
      whenNotMatched: "insert"
    }
  }
]);
```
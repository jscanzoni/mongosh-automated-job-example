// Connection string and namespace variables
const connectionString='mongodb://localhost:27017';
const namespace='mongosh_test';

// Connect to the database
const db=connect(`${connectionString}/${namespace}`);

// Insert five documents into the 'source' collection
for (let i=0; i<5; i++) {
    let value=Math.floor(Math.random()*10)+1;
    db.source.insertOne({
        value: value,
        type: value%2===0? "even":"odd"
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

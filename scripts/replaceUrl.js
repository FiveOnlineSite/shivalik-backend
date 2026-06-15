require("dotenv").config();
const mongoose = require("mongoose");
const dns = require("dns");

// Force Node.js to use Google/Cloudflare DNS
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const OLD_BASE_URL = "https://shivalik-bucket.s3.eu-north-1.amazonaws.com";
const NEW_BASE_URL = "https://d3k5js43cf9585.cloudfront.net";

const DRY_RUN = process.env.DRY_RUN === "true";

const isSkippableObject = (value) => {
  return (
    value instanceof Date ||
    Buffer.isBuffer(value) ||
    value?._bsontype // ObjectId, Decimal128, Binary, etc.
  );
};

const replaceUrlDeep = (value) => {
  let changed = false;

  if (typeof value === "string") {
    if (value.includes(OLD_BASE_URL)) {
      return {
        value: value.split(OLD_BASE_URL).join(NEW_BASE_URL),
        changed: true,
      };
    }

    return { value, changed: false };
  }

  if (Array.isArray(value)) {
    const newArray = value.map((item) => {
      const result = replaceUrlDeep(item);
      if (result.changed) changed = true;
      return result.value;
    });

    return { value: newArray, changed };
  }

  if (value && typeof value === "object" && !isSkippableObject(value)) {
    const newObject = {};

    for (const key of Object.keys(value)) {
      // Do not touch MongoDB _id fields
      if (key === "_id") {
        newObject[key] = value[key];
        continue;
      }

      const result = replaceUrlDeep(value[key]);

      if (result.changed) changed = true;

      newObject[key] = result.value;
    }

    return { value: newObject, changed };
  }

  return { value, changed: false };
};

const replaceAllS3Urls = async () => {
  try {
    if (!process.env.MONGO_DB_URL) {
      throw new Error("MONGO_DB_URL is missing in .env");
    }

    await mongoose.connect(process.env.MONGO_DB_URL);
    console.log("MongoDB connected");

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();

    let totalMatchedDocs = 0;
    let totalModifiedDocs = 0;

    for (const collectionInfo of collections) {
      const collectionName = collectionInfo.name;

      // Skip Mongo system collections
      if (collectionName.startsWith("system.")) continue;

      const collection = db.collection(collectionName);
      const cursor = collection.find({});

      let collectionMatched = 0;
      let collectionModified = 0;

      while (await cursor.hasNext()) {
        const doc = await cursor.next();

        const result = replaceUrlDeep(doc);

        if (!result.changed) continue;

        collectionMatched++;
        totalMatchedDocs++;

        console.log(`Found old S3 URL in collection: ${collectionName}, _id: ${doc._id}`);

        if (!DRY_RUN) {
          const updatedDoc = { ...result.value };
          delete updatedDoc._id;

          const updateResult = await collection.updateOne(
            { _id: doc._id },
            { $set: updatedDoc }
          );

          if (updateResult.modifiedCount > 0) {
            collectionModified++;
            totalModifiedDocs++;
          }
        }
      }

      if (collectionMatched > 0) {
        console.log(
          `${collectionName}: matched ${collectionMatched}, modified ${collectionModified}`
        );
      }
    }

    console.log("--------------------------------");
    console.log(`Total matched documents: ${totalMatchedDocs}`);
    console.log(`Total modified documents: ${totalModifiedDocs}`);

    if (DRY_RUN) {
      console.log("DRY_RUN=true, so no records were updated.");
    } else {
      console.log("All old S3 URLs replaced successfully.");
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Error replacing URLs:", error);
    process.exit(1);
  }
};

replaceAllS3Urls();
import clientPromise from "./mongo";

export async function getDb() {
  const client = await clientPromise;
  if (!client) {
    return {
      collection: () => ({
        find: () => ({
          toArray: async () => [],
          sort: () => ({ limit: () => ({ toArray: async () => [] }) })
        }),
        findOne: async () => null,
        insertOne: async () => ({ insertedId: null }),
        updateOne: async () => ({ modifiedCount: 0 }),
        findOneAndUpdate: async () => ({ value: null })
      })
    };
  }
  return client.db();
}
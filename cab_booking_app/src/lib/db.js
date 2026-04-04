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
        insertOne: async () => ({ insertedId: null }),
        updateOne: async () => ({ modifiedCount: 0 })
      })
    };
  }
  return client.db();
}
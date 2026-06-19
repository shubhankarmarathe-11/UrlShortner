import { RedisCli } from "./config/redis.ts";
import { UrlModel } from "./Sorting.model.ts";
import { MongoClient } from "mongodb";

export async function EntryService({
  slug,
  userId,
  longlink,
  expiretime,
}: {
  slug: string;
  userId: string;
  longlink: string;
  expiretime: string;
}) {
  const client = new MongoClient(`${process.env.MONGODB_URI}`);

  try {
    await client.connect();
  } catch (error) {
    console.error(error);
    return { status: false, mess: "not connected" };
  }

  const db = client.db(`${process.env.MONGO_DB_DBNAME}`);

  const urlcolletion = await db.collection("urlmodels");
  const urlanalyticcollection = await db.collection("linkanalyticsmodels");
  await urlcolletion.createIndex({ expireAt: 1 }, { expireAfterSeconds: 10 });

  const session = await client.startSession();
  try {
    await session.startTransaction();

    const InsetDoc = await urlcolletion.insertOne(
      {
        LongUrl: longlink,
        UserId: userId,
        Slug: slug,
        expireAt: expiretime,
      },
      { session: session },
    );

    const analytics = await urlanalyticcollection.insertOne(
      { LinkId: InsetDoc.insertedId },
      { session: session },
    );

    await urlcolletion.updateOne(
      { _id: InsetDoc.insertedId },
      { $push: { LinkAnalytics: analytics.insertedId } },
      { session: session },
    );

    await session.commitTransaction();
    await session.endSession();

    return { status: true, mess: "Data inserted" };
  } catch (error) {
    console.error(error);
    await session.abortTransaction();
    await session.endSession();
    return { status: false, mess: "transaction error" };
  }
}

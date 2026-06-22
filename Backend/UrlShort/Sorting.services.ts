import { RedisCli } from "./config/redis.ts";
import { UrlModel, LinkAnalyticsModel } from "./Sorting.model.ts";
import { db, client } from "./config/mongoconfig.ts";
import { ObjectId } from "mongodb";

export async function EntryService({
  slug,
  userId,
  longlink,
  expiretime,
}: {
  slug: string;
  userId: string;
  longlink: string;
  expiretime: object;
}) {
  const urlcolletion = await db.collection("urlmodels");
  const urlanalyticcollection = await db.collection("linkanalyticsmodels");

  const session = client.startSession();
  try {
    session.startTransaction();

    const InsetDoc = await urlcolletion.insertOne(
      {
        LongUrl: longlink,
        UserId: new ObjectId(userId),
        Slug: slug,
        expireAt: expiretime,
      },
      { session: session },
    );
    await urlcolletion.createIndex({ expireAt: 1 }, { expireAfterSeconds: 0 });

    const analytics = await urlanalyticcollection.insertOne(
      {
        LinkId: InsetDoc.insertedId,
        userId: new ObjectId(userId),
        expireAt: expiretime,
      },
      { session: session },
    );

    await urlanalyticcollection.createIndex(
      { expireAt: 1 },
      { expireAfterSeconds: 0 },
    );

    await urlcolletion.updateOne(
      { _id: InsetDoc.insertedId },
      { $push: { LinkAnalytics: analytics.insertedId } },
      { session: session },
    );

    await session.commitTransaction();
    await session.endSession();

    const exdatetime: any = new Date(String(expiretime));
    const current: any = new Date();

    const remainingSeconds = Math.floor((exdatetime - current) / 1000);

    await RedisCli.hset(`${userId}:${slug}`, {
      link_id: InsetDoc.insertedId,
      analytics_id: analytics.insertedId,
      longlink: longlink,
    });

    await RedisCli.expire(`${userId}:${slug}`, remainingSeconds);

    return { status: true, mess: "Data inserted" };
  } catch (error) {
    console.error(error);
    await session.abortTransaction();
    await session.endSession();
    return { status: false, mess: "transaction error" };
  }
}

export async function GetAllLinks({ userId }: { userId: string }) {
  try {
    const Fetch = await UrlModel.find({ UserId: userId });

    if (Fetch.length == 0)
      return { status: true, mess: "Data not Found", data: null };

    return { status: true, mess: "Data Found", data: Fetch };
  } catch (error) {
    console.error(error);
    await session.abortTransaction();
    await session.endSession();
    return { status: false, mess: "transaction error", data: null };
  }
}

export async function FetchDataWithSlug({ slug }: { slug: string }) {
  try {
    const FetchData = await UrlModel.findOne({ Slug: slug });
    console.log(FetchData);

    if (FetchData == null)
      return { status: true, mess: "Link Expired", data: null };

    return { status: true, mess: "link active", data: FetchData };
  } catch (error) {
    console.error(error);
    return { status: false, mess: "mongodb eror", data: null };
  }
}

export async function UpdateAnalytics({ LinkId }: { LinkId: string }) {
  try {
    const Update = await LinkAnalyticsModel.updateOne(
      { LinkId: LinkId },
      { $push: { Data: {} } },
    );
  } catch (error) {
    console.error(error);
    return { status: false, mess: "mongodb eror" };
  }
}

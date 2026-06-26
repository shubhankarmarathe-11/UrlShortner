import type { Request, Response, NextFunction } from "express";
import { RedisCli } from "./config/redis.ts";
import { FetchDataWithSlug } from "./Sorting.services.ts";

export async function VerifyAccessToken(
  req: Request,
  res: Response,
  Next: NextFunction,
) {
  try {
    let refreshtoken = req.cookies["refreshToken"];

    req.userId = await RedisCli.get(String(refreshtoken));

    if (req.userId == null) return res.status(500).send("token expired");

    Next();
  } catch (error) {
    console.error(error);
    return res.status(500).send("server error please try again");
  }
}

export async function CreateNewEntryMiddleware(
  req: Request,
  res: Response,
  Next: NextFunction,
) {
  try {
    let { slug, longlink, expiretime } = req.body;

    if ((await RedisCli.get(`${req.ip}newentry`)) != null)
      return res.status(401).send("in progress please wait");

    await RedisCli.set(`${req.ip}newentry`, "true");

    if (slug == "" || longlink == "" || expiretime == "") {
      await RedisCli.del(`${req.ip}newentry`);
      return res.status(401).send(" please enter the proper details");
    }

    const findslug = await RedisCli.get(`${slug}`);

    if (findslug == null) return Next();

    await RedisCli.del(`${req.ip}newentry`);
    return res.status(401).send("please select another name for url");
  } catch (error) {
    console.error(error);
    await RedisCli.del(`${req.ip}newentry`);
    return res.status(500).send("server error please try again");
  }
}

export async function RedirectMiddleware(
  req: Request,
  res: Response,
  Next: NextFunction,
) {
  try {
    let { slug, userid } = req.params;

    const FindLongUrl = await RedisCli.hgetall(`${userid}:${slug}`);

    if (FindLongUrl == null) {
      const Fetch = await FetchDataWithSlug({ slug: String(slug) });

      if (Fetch.status == false)
        return res.status(500).send("server error please try again");

      if (Fetch.mess == "Link Expired")
        return res.status(404).send("link expired");

      req.link_id = Fetch.data?._id;
      req.analytics_id = Fetch.data?.LinkAnalytics[0];
      req.LongURL = Fetch.data?.LongUrl;

      await RedisCli.hset(`${userid}:${slug}`, {
        link_id: Fetch.data?._id,
        analytics_id: Fetch.data?.LinkAnalytics[0],
        longlink: Fetch.data?.LongUrl,
      });

      const exdatetime: any = new Date(String(Fetch.data?.expireAt));
      const current: any = new Date();

      const remainingSeconds = Math.floor((exdatetime - current) / 1000);

      await RedisCli.expire(`${userid}:${slug}`, remainingSeconds);

      Next();
    }

    req.link_id = FindLongUrl.link_id;
    req.analytics_id = FindLongUrl.analytics_id;
    req.LongURL = FindLongUrl.longlink;

    Next();
  } catch (error) {
    console.error(error);
    return res.status(500).send("server error please try again");
  }
}

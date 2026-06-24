import type { Request, Response } from "express";
import { UrlModel } from "./Sorting.model.ts";
import {
  EntryService,
  GetAllLinks,
  UpdateAnalytics,
  FetchAnalyticsService,
  DeleteLinkService,
} from "./Sorting.services.ts";
import { RedisCli } from "./config/redis.ts";
import { UAParser } from "ua-parser-js";

export async function CreateEntry(req: Request, res: Response) {
  try {
    let { slug, longlink, expiretime } = req.body;
    let userId = req.userId;

    const Insert = await EntryService({
      slug: slug,
      expiretime: new Date(expiretime),
      longlink: longlink,
      userId: userId,
    });

    if (Insert.mess == "transaction error")
      return res.status(500).send("server error please try again");
    if (Insert.mess == "not connected")
      return res.status(500).send("server error please try again");

    return res.status(201).send(Insert.mess);
  } catch (error) {
    console.error(error);
    return res.status(500).send("server error please try again");
  }
}

export async function GetLinksController(req: Request, res: Response) {
  try {
    const FetchAllLinks = await GetAllLinks({ userId: String(req.userId) });

    if (FetchAllLinks.mess == "transaction error")
      return res.status(500).send("server error please try again");

    if (FetchAllLinks.mess == "Data not Found")
      return res.status(404).send("no data available");

    return res.status(200).send({ data: FetchAllLinks.data });
  } catch (error) {
    console.error(error);
    return res.status(500).send("server error please try again");
  }
}

export async function RedirectController(req: Request, res: Response) {
  try {
    const parser = new UAParser(req.headers["user-agent"]);

    const result = parser.getResult();

    const analytics = {
      userip: req.headers["x-forwarded-for"] || req.socket.remoteAddress,

      clickedAt: new Date(),

      userAgent: req.headers["user-agent"],

      country: null, // later via geo service
      city: null,

      browser: result.browser.name,

      os: result.os.name,

      deviceType: result.device.type || "desktop",

      referer: req.headers["referer"] || null,

      utmSource: req.query.utm_source,

      utmMedium: req.query.utm_medium,

      utmCampaign: req.query.utm_campaign,

      responseTimeMs: null,

      isUnique: false,
    };

    const UpdateIt = await UpdateAnalytics({
      analyticsId: String(req.analytics_id),
      dataObj: analytics,
    });

    if (UpdateIt.status == false)
      return res.status(500).send("server error please try again");

    return res.redirect(String(req.LongURL));
  } catch (error) {
    console.error(error);
    return res.status(500).send("server error please try again");
  }
}

export async function FetchAnalyticsController(req: Request, res: Response) {
  try {
    let { analytics_id } = req.params;
    const Fetch = await FetchAnalyticsService({ analyticsId: analytics_id });

    if (Fetch.mess == "mongodb eror")
      return res.status(500).send("server error please try again");

    if (Fetch.mess == "not found")
      return res.status(404).send("data not found");

    return res.status(200).send({ data: Fetch });
  } catch (error) {
    console.error(error);
    return res.status(500).send("server error please try again");
  }
}

export async function DeleteLinkController(req: Request, res: Response) {
  try {
    let { link_id } = req.params;

    const Deletelink = await DeleteLinkService({ linkId: String(link_id) });

    if (Deletelink.status == false)
      return res.status(500).send("server error please try again");

    if (Deletelink.mess == "Data not found")
      return res.status(404).send("data not found");

    return res.status(201).send("Link removed");
  } catch (error) {
    console.error(error);
    return res.status(500).send("server error please try again");
  }
}

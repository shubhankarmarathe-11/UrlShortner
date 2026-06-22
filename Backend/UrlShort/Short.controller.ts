import type { Request, Response } from "express";
import { UrlModel } from "./Sorting.model.ts";
import { EntryService, GetAllLinks } from "./Sorting.services.ts";
import { RedisCli } from "./config/redis.ts";

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
      return res.status(404).send("no data availabe");

    return res.status(200).send({ data: FetchAllLinks.data });
  } catch (error) {
    console.error(error);
    return res.status(500).send("server error please try again");
  }
}
export async function RedirectController(req: Request, res: Response) {
  try {
    return res.redirect(String(req.LongURL));
  } catch (error) {
    console.error(error);
    return res.status(500).send("server error please try again");
  }
}

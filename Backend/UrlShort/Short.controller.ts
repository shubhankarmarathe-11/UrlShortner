import type { Request, Response } from "express";
import { UrlModel } from "./Sorting.model.ts";
import { EntryService } from "./Sorting.services.ts";

export async function CreateEntry(req: Request, res: Response) {
  try {
    let { slug, longlink, expiretime } = req.body;
    let userId = req.userId;

    const Insert = await EntryService({
      slug: slug,
      expiretime: expiretime,
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
export async function GetALLLinks(req: Request, res: Response) {
  try {
  } catch (error) {
    console.error(error);
    return res.status(500).send("server error please try again");
  }
}
export async function RedirectController(req: Request, res: Response) {
  try {
    let { id, slug } = req.params;
  } catch (error) {
    console.error(error);
    return res.status(500).send("server error please try again");
  }
}

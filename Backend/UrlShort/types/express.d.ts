import "express";

declare global {
  namespace Express {
    interface Request {
      userId?: any;
      payload?: any;
      link_id?: any;
      analytics_id?: any;
      LongURL?: any;
    }
  }
}

export {};

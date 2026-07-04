import "express";

declare global {
  namespace Express {
    interface Request {
      userId?: any;
      payload?: any;
    }
  }
}

export {};

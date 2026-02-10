/* eslint-disable @typescript-eslint/no-namespace */

// Augment Express Request to include user property set by auth middleware
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        name: string;
        email: string;
        createdAt: Date;
        updatedAt: Date;
      };
    }
  }
}

export {};

import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest, JWTPayload } from "./auth";
import connectDB from "./mongodb";

export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload;
}

export function withAuth(
  handler: (req: AuthenticatedRequest, context?: any) => Promise<NextResponse>,
  options?: {
    roles?: ("customer" | "seller" | "admin")[];
  }
) {
  return async (req: NextRequest, context?: any) => {
    try {
      await connectDB();

      const user = await authenticateRequest(req);

      if (!user) {
        return NextResponse.json(
          { error: "Unauthorized - Please login" },
          { status: 401 }
        );
      }

      if (options?.roles && !options.roles.includes(user.role)) {
        return NextResponse.json(
          { error: "Forbidden - Insufficient permissions" },
          { status: 403 }
        );
      }

      const authenticatedReq = req as AuthenticatedRequest;
      authenticatedReq.user = user;

      return handler(authenticatedReq, context);
    } catch (error: any) {
      console.error("Middleware error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  };
}

export function withDB(
  handler: (req: NextRequest, context?: any) => Promise<NextResponse>
) {
  return async (req: NextRequest, context?: any) => {
    try {
      await connectDB();
      return handler(req, context);
    } catch (error: any) {
      console.error("Database connection error:", error);
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 500 }
      );
    }
  };
}

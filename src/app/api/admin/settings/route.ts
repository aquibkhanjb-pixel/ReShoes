import { NextRequest, NextResponse } from "next/server";
import { withAuth, AuthenticatedRequest } from "@/lib/api-middleware";
import Settings from "@/models/Settings";
import { z } from "zod";

const updateSettingsSchema = z.object({
  commissionRate: z.number().min(0).max(100).optional(),
  platformName: z.string().optional(),
  contactEmail: z.string().email().optional(),
});

// GET settings
async function getSettings(req: AuthenticatedRequest) {
  try {
    let settings = await Settings.findOne();

    if (!settings) {
      settings = await Settings.create({
        commissionRate: 10,
        platformName: "ReShoe",
        contactEmail: "support@reshoe.com",
      });
    }

    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error: any) {
    console.error("Get settings error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

// PUT update settings
async function updateSettings(req: AuthenticatedRequest) {
  try {
    const body = await req.json();
    const validatedData = updateSettingsSchema.parse(body);

    let settings = await Settings.findOne();

    if (!settings) {
      settings = await Settings.create(validatedData);
    } else {
      Object.assign(settings, validatedData);
      await settings.save();
    }

    return NextResponse.json({
      success: true,
      message: "Settings updated successfully",
      settings,
    });
  } catch (error: any) {
    console.error("Update settings error:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to update settings" },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getSettings, { roles: ["admin"] });
export const PUT = withAuth(updateSettings, { roles: ["admin"] });

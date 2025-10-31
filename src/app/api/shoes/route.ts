import { NextRequest, NextResponse } from "next/server";
import { withAuth, AuthenticatedRequest, withDB } from "@/lib/api-middleware";
import Shoe from "@/models/Shoe";
import User from "@/models/User"; // Import User model for population
import { uploadMultipleImages } from "@/lib/cloudinary";
import { z } from "zod";

const createShoeSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  brand: z.string().min(2, "Brand must be at least 2 characters"),
  size: z.number().min(1).max(20),
  condition: z.enum(["new", "like-new", "good", "fair", "worn"]),
  price: z.number().min(0, "Price cannot be negative"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  images: z.array(z.string()).min(1, "At least one image is required"),
  category: z.enum(["men", "women", "unisex", "kids"]),
});

// GET all shoes with filters
async function getShoes(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const category = searchParams.get("category");
    const brand = searchParams.get("brand");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const condition = searchParams.get("condition");
    const size = searchParams.get("size");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") || "-createdAt";

    // Build filter query - only show approved products to public
    const filter: any = { status: "approved" };

    if (category) filter.category = category;
    if (brand) filter.brand = new RegExp(brand, "i");
    if (condition) filter.condition = condition;
    if (size) filter.size = parseFloat(size);

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    if (search) {
      filter.$or = [
        { title: new RegExp(search, "i") },
        { brand: new RegExp(search, "i") },
        { description: new RegExp(search, "i") },
      ];
    }

    const skip = (page - 1) * limit;

    const [shoes, total] = await Promise.all([
      Shoe.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Shoe.countDocuments(filter),
    ]);

    return NextResponse.json({
      success: true,
      shoes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Get shoes error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch shoes" },
      { status: 500 }
    );
  }
}

// POST create new shoe
async function createShoe(req: AuthenticatedRequest) {
  try {
    // Only sellers can create shoes
    if (req.user!.role !== "seller") {
      return NextResponse.json(
        { error: "Only sellers can create shoe listings" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validatedData = createShoeSchema.parse(body);

    // Upload images to Cloudinary
    let imageUrls: string[] = [];
    if (validatedData.images && validatedData.images.length > 0) {
      imageUrls = await uploadMultipleImages(
        validatedData.images,
        "reshoe/shoes"
      );
    }

    // Create shoe with pending approval status
    const shoe = await Shoe.create({
      ...validatedData,
      images: imageUrls,
      seller: req.user!.userId,
      status: "pending-approval",
      approvalStatus: "pending",
    });

    const populatedShoe = await Shoe.findById(shoe._id).populate(
      "seller",
      "name email"
    );

    return NextResponse.json(
      {
        success: true,
        message: "Shoe created successfully",
        shoe: populatedShoe,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create shoe error:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to create shoe" },
      { status: 500 }
    );
  }
}

export const GET = withDB(getShoes);
export const POST = withAuth(createShoe);

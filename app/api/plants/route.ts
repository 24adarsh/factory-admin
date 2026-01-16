export const runtime = "nodejs";

import { NextResponse } from "next/server";
import db from "@/lib/dynamodb";
import {
  ScanCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";

const TABLE = "Plants";

/* ======================================================
   GET /api/plants
====================================================== */
export async function GET() {
  try {
    const data = await db.send(
      new ScanCommand({
        TableName: TABLE,
        Limit: 200,
      })
    );

    return NextResponse.json(data.Items ?? []);
  } catch (error) {
    console.error("GET Plants error:", error);
    return NextResponse.json(
      { error: "Failed to fetch plants" },
      { status: 500 }
    );
  }
}

/* ======================================================
   POST /api/plants
====================================================== */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = body.name?.trim();

    if (!name) {
      return NextResponse.json(
        { error: "Plant name required" },
        { status: 400 }
      );
    }

    const item = {
      plantId: `PLANT#${randomUUID()}`,
      name,
      location: body.location?.trim() ?? "",
      createdAt: new Date().toISOString(),
    };

    await db.send(
      new PutCommand({
        TableName: TABLE,
        Item: item,
      })
    );

    return NextResponse.json(item);
  } catch (error) {
    console.error("POST Plant error:", error);
    return NextResponse.json(
      { error: "Failed to create plant" },
      { status: 500 }
    );
  }
}

/* ======================================================
   PUT /api/plants
====================================================== */
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { searchParams } = new URL(req.url);

    // ✅ FIX: read plantId from query OR body
    const plantId =
      searchParams.get("plantId") || body.plantId;

    const name = body.name?.trim();
    const location =
      body.location !== undefined
        ? body.location.trim()
        : undefined;

    if (!plantId) {
      return NextResponse.json(
        { error: "plantId required" },
        { status: 400 }
      );
    }

    const updates: string[] = [];
    const values: any = {};
    const names: any = {};

    if (name) {
      updates.push("#name = :name");
      values[":name"] = name;
      names["#name"] = "name";
    }

    if (location !== undefined) {
      updates.push("location = :location");
      values[":location"] = location;
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: "Nothing to update" },
        { status: 400 }
      );
    }

    const result = await db.send(
      new UpdateCommand({
        TableName: TABLE,
        Key: { plantId },
        UpdateExpression: `SET ${updates.join(", ")}`,
        ExpressionAttributeNames: names,
        ExpressionAttributeValues: values,
        ReturnValues: "ALL_NEW",
      })
    );

    return NextResponse.json(result.Attributes);
  } catch (error) {
    console.error("PUT Plant error:", error);
    return NextResponse.json(
      { error: "Failed to update plant" },
      { status: 500 }
    );
  }
}

/* ======================================================
   DELETE /api/plants?plantId=PLANT#xxx
====================================================== */
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const plantId = searchParams.get("plantId");

    if (!plantId) {
      return NextResponse.json(
        { error: "plantId required" },
        { status: 400 }
      );
    }

    await db.send(
      new DeleteCommand({
        TableName: TABLE,
        Key: { plantId },
      })
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE Plant error:", error);
    return NextResponse.json(
      { error: "Failed to delete plant" },
      { status: 500 }
    );
  }
}

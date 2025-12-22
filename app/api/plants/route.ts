import { NextResponse } from "next/server";
import db from "@/lib/dynamodb";
import {
  ScanCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";

const TABLE = "Plants";

/**
 * GET /api/plants
 * Optional:
 *   ?name=Pune Plant
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get("name");

    /* ✅ Query by name using GSI */
    if (name) {
      const data = await db.send(
        new QueryCommand({
          TableName: TABLE,
          IndexName: "name-index",
          KeyConditionExpression: "#name = :name",
          ExpressionAttributeNames: {
            "#name": "name",
          },
          ExpressionAttributeValues: {
            ":name": name,
          },
        })
      );

      return NextResponse.json(data.Items || []);
    }

    /* ⚠️ Fallback: list all plants */
    const data = await db.send(
      new ScanCommand({
        TableName: TABLE,
        Limit: 50,
      })
    );

    return NextResponse.json(data.Items || []);
  } catch (error) {
    console.error("GET Plants error:", error);
    return NextResponse.json(
      { error: "Failed to fetch plants" },
      { status: 500 }
    );
  }
}

/* ================= CREATE PLANT ================= */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.name) {
      return NextResponse.json(
        { error: "Plant name required" },
        { status: 400 }
      );
    }

    const item = {
      plantId: `PLANT#${randomUUID()}`,
      name: body.name,
      location: body.location || "",
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

/* ================= UPDATE PLANT ================= */
export async function PUT(req: Request) {
  try {
    const body = await req.json();

    if (!body.plantId || !body.name) {
      return NextResponse.json(
        { error: "plantId and name required" },
        { status: 400 }
      );
    }

    await db.send(
      new UpdateCommand({
        TableName: TABLE,
        Key: { plantId: body.plantId },
        UpdateExpression:
          "SET #name = :name, location = :location",
        ExpressionAttributeNames: {
          "#name": "name",
        },
        ExpressionAttributeValues: {
          ":name": body.name,
          ":location": body.location || "",
        },
      })
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PUT Plant error:", error);
    return NextResponse.json(
      { error: "Failed to update plant" },
      { status: 500 }
    );
  }
}

/* ================= DELETE PLANT ================= */
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

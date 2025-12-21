import { NextResponse } from "next/server";
import db from "@/lib/dynamodb";
import { PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";

const TABLE = "Attendance";

/**
 * GET /api/attendance
 */
export async function GET() {
  try {
    console.log("GET /api/attendance called");

    const data = await db.send(
      new ScanCommand({
        TableName: TABLE,
        Limit: 5,
      })
    );

    console.log("DynamoDB scan success", data.Items);

    return NextResponse.json(data.Items || []);
  } catch (error) {
    console.error("DynamoDB GET error:", error);

    return NextResponse.json(
      { error: "Failed to fetch attendance" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/attendance
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("POST body:", body);

    await db.send(
      new PutCommand({
        TableName: TABLE,
        Item: {
          employeeId: body.employeeId,
          date: body.date,
          plantId: body.plantId,
          shiftType: body.shiftType,
          multiplier: body.multiplier,
          createdAt: new Date().toISOString(),
        },
      })
    );

    console.log("DynamoDB put success");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DynamoDB PUT error:", error);

    return NextResponse.json(
      { error: "Failed to save attendance" },
      { status: 500 }
    );
  }
}

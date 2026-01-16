export const runtime = "nodejs";

import { NextResponse } from "next/server";
import db from "@/lib/dynamodb";
import {
  PutCommand,
  ScanCommand,
  UpdateCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";

const TABLE = "Attendance";

/* ===============================
   SHIFT MULTIPLIERS
================================ */
const SHIFT_MULTIPLIER: Record<string, number> = {
  DAY_HALF: 0.5,
  DAY_FULL: 1.0,
  NIGHT_HALF: 0.5,
  NIGHT_FULL: 1.0,
  DAY_NIGHT: 2.0,
};

/* ===============================
   GET /api/attendance
================================ */
export async function GET() {
  try {
    const data = await db.send(
      new ScanCommand({
        TableName: TABLE,
        Limit: 500,
      })
    );

    return NextResponse.json(data.Items ?? []);
  } catch (error) {
    console.error("Attendance GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch attendance" },
      { status: 500 }
    );
  }
}

/* ===============================
   POST /api/attendance
================================ */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const shiftType = body.shiftType || body.shift;

    if (!body.employeeId || !body.plantId || !body.date || !shiftType) {
      return NextResponse.json(
        { error: "employeeId, plantId, date, shiftType required" },
        { status: 400 }
      );
    }

    const multiplier = SHIFT_MULTIPLIER[shiftType];
    if (!multiplier) {
      return NextResponse.json(
        { error: "Invalid shiftType" },
        { status: 400 }
      );
    }

    // 🔒 Prevent duplicate attendance (same employee + date)
    const existing = await db.send(
      new ScanCommand({
        TableName: TABLE,
        FilterExpression:
          "employeeId = :e AND #d = :d",
        ExpressionAttributeNames: { "#d": "date" },
        ExpressionAttributeValues: {
          ":e": body.employeeId,
          ":d": body.date,
        },
      })
    );

    if ((existing.Items?.length ?? 0) > 0) {
      return NextResponse.json(
        { error: "Attendance already marked for this date" },
        { status: 409 }
      );
    }

    const item = {
      attendanceId: `ATT#${randomUUID()}`,
      employeeId: body.employeeId,
      plantId: body.plantId,
      date: body.date,
      shiftType,
      multiplier,
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
    console.error("Attendance POST error:", error);
    return NextResponse.json(
      { error: "Failed to save attendance" },
      { status: 500 }
    );
  }
}

/* ===============================
   PUT /api/attendance
   (Edit attendance)
================================ */
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { searchParams } = new URL(req.url);

    // ✅ FIX: read from query OR body
    const attendanceId =
      searchParams.get("attendanceId") || body.attendanceId;

    const { shiftType } = body;

    if (!attendanceId || !shiftType) {
      return NextResponse.json(
        { error: "attendanceId and shiftType required" },
        { status: 400 }
      );
    }

    const multiplier = SHIFT_MULTIPLIER[shiftType];
    if (!multiplier) {
      return NextResponse.json(
        { error: "Invalid shiftType" },
        { status: 400 }
      );
    }

    const result = await db.send(
      new UpdateCommand({
        TableName: TABLE,
        Key: { attendanceId },
        UpdateExpression:
          "SET shiftType = :s, multiplier = :m, updatedAt = :u",
        ExpressionAttributeValues: {
          ":s": shiftType,
          ":m": multiplier,
          ":u": new Date().toISOString(),
        },
        ReturnValues: "ALL_NEW",
      })
    );

    return NextResponse.json(result.Attributes);
  } catch (error) {
    console.error("Attendance PUT error:", error);
    return NextResponse.json(
      { error: "Failed to update attendance" },
      { status: 500 }
    );
  }
}

/* ===============================
   DELETE /api/attendance
================================ */
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const attendanceId = searchParams.get("attendanceId");

    if (!attendanceId) {
      return NextResponse.json(
        { error: "attendanceId required" },
        { status: 400 }
      );
    }

    await db.send(
      new DeleteCommand({
        TableName: TABLE,
        Key: { attendanceId },
      })
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Attendance DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete attendance" },
      { status: 500 }
    );
  }
}

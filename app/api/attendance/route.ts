export const runtime = "nodejs";

import { NextResponse } from "next/server";
import db from "@/lib/dynamodb";
import {
  PutCommand,
  ScanCommand,
  QueryCommand,
  UpdateCommand,
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
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    if (from && to) {
      const data = await db.send(
        new QueryCommand({
          TableName: TABLE,
          IndexName: "date-index",
          KeyConditionExpression: "#date BETWEEN :from AND :to",
          ExpressionAttributeNames: { "#date": "date" },
          ExpressionAttributeValues: { ":from": from, ":to": to },
        })
      );
      return NextResponse.json(data.Items || []);
    }

    const data = await db.send(
      new ScanCommand({ TableName: TABLE, Limit: 100 })
    );

    return NextResponse.json(data.Items || []);
  } catch (error) {
    console.error("Attendance GET error:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

/* ===============================
   POST /api/attendance
================================ */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const shift = body.shiftType || body.shift;

    if (!body.employeeId || !body.date || !body.plantId || !shift) {
      return NextResponse.json(
        { error: "employeeId, date, plantId, shiftType required" },
        { status: 400 }
      );
    }

    const multiplier = SHIFT_MULTIPLIER[shift];
    if (!multiplier) {
      return NextResponse.json({ error: "Invalid shift" }, { status: 400 });
    }

    const attendanceId = `ATT#${randomUUID()}`;
    const ttl =
      Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 365 * 2;

    const item = {
      attendanceId,
      date: body.date,
      employeeId: body.employeeId,
      plantId: body.plantId,
      shiftType: shift,
      multiplier,
      createdAt: new Date().toISOString(),
      ttl,
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
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}

/* ===============================
   PUT /api/attendance
   (Edit attendance)
================================ */
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { attendanceId, date, shiftType } = body;

    if (!attendanceId || !date || !shiftType) {
      return NextResponse.json(
        { error: "attendanceId, date, shiftType required" },
        { status: 400 }
      );
    }

    const multiplier = SHIFT_MULTIPLIER[shiftType];

    await db.send(
      new UpdateCommand({
        TableName: TABLE,
        Key: { attendanceId, date },
        UpdateExpression:
          "SET shiftType = :s, multiplier = :m, updatedAt = :u",
        ExpressionAttributeValues: {
          ":s": shiftType,
          ":m": multiplier,
          ":u": new Date().toISOString(),
        },
      })
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Attendance UPDATE error:", error);
    return NextResponse.json(
      { error: "Failed to update" },
      { status: 500 }
    );
  }
}

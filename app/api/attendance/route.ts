export const runtime = "nodejs";

import { NextResponse } from "next/server";
import db from "@/lib/dynamodb";
import {
  PutCommand,
  ScanCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";

const TABLE = "Attendance";

/* SHIFT MULTIPLIERS */
const SHIFT_MULTIPLIER: Record<string, number> = {
  DAY: 1.0,
  NIGHT: 1.0,
  HALF: 0.5,
};

/* ===============================
   GET /api/attendance
   ?from=YYYY-MM-DD&to=YYYY-MM-DD
================================ */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    /* If date range provided → use GSI */
    if (from && to) {
      const data = await db.send(
        new QueryCommand({
          TableName: TABLE,
          IndexName: "date-index",
          KeyConditionExpression: "#date BETWEEN :from AND :to",
          ExpressionAttributeNames: {
            "#date": "date",
          },
          ExpressionAttributeValues: {
            ":from": from,
            ":to": to,
          },
        })
      );

      return NextResponse.json(data.Items || []);
    }

    /* Fallback – scan last 100 */
    const data = await db.send(
      new ScanCommand({
        TableName: TABLE,
        Limit: 100,
      })
    );

    return NextResponse.json(data.Items || []);
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

    if (
      !body.employeeId ||
      !body.date ||
      !body.plantId ||
      !body.shiftType
    ) {
      return NextResponse.json(
        { error: "employeeId, date, plantId, shiftType required" },
        { status: 400 }
      );
    }

    const multiplier =
      SHIFT_MULTIPLIER[body.shiftType] ?? 1;

    const attendanceId = `ATT#${randomUUID()}`;

    const ttl =
      Math.floor(Date.now() / 1000) +
      60 * 60 * 24 * 365 * 2; // 2 years

    const item = {
      attendanceId,          // PK
      date: body.date,       // SK
      employeeId: body.employeeId,
      plantId: body.plantId,
      shiftType: body.shiftType,
      multiplier,
      createdAt: new Date().toISOString(),
      ttl,
    };

    console.log("Saving attendance:", item);

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

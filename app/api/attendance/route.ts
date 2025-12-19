import { NextResponse } from "next/server";
import db from "@/lib/dynamodb";
import { PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";

const TABLE = "Attendance";

export async function GET() {
  const data = await db.send(new ScanCommand({ TableName: TABLE }));
  return NextResponse.json(data.Items || []);
}

export async function POST(req: Request) {
  const body = await req.json();

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

  return NextResponse.json({ success: true });
}

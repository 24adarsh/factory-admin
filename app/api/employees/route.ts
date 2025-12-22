import { NextResponse } from "next/server";
import db from "@/lib/dynamodb";
import {
  ScanCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";

const TABLE = "Employees";

/* ============== GET ALL EMPLOYEES ============== */
export async function GET() {
  try {
    const data = await db.send(
      new ScanCommand({ TableName: TABLE })
    );
    return NextResponse.json(data.Items || []);
  } catch (err) {
    console.error("GET Employees error:", err);
    return NextResponse.json(
      { error: "Failed to fetch employees" },
      { status: 500 }
    );
  }
}

/* ============== CREATE EMPLOYEE ============== */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.name || !body.plantId || !body.dailySalary) {
      return NextResponse.json(
        { error: "name, plantId, dailySalary required" },
        { status: 400 }
      );
    }

    const item = {
      employeeId: `EMP#${randomUUID()}`,
      name: body.name,
      plantId: body.plantId,
      dailySalary: Number(body.dailySalary),
      createdAt: new Date().toISOString(),
    };

    await db.send(
      new PutCommand({
        TableName: TABLE,
        Item: item,
      })
    );

    return NextResponse.json(item);
  } catch (err) {
    console.error("POST Employee error:", err);
    return NextResponse.json(
      { error: "Failed to create employee" },
      { status: 500 }
    );
  }
}

/* ============== UPDATE EMPLOYEE ============== */
export async function PUT(req: Request) {
  try {
    const body = await req.json();

    if (!body.employeeId || !body.name) {
      return NextResponse.json(
        { error: "employeeId and name required" },
        { status: 400 }
      );
    }

    await db.send(
      new UpdateCommand({
        TableName: TABLE,
        Key: { employeeId: body.employeeId },
        UpdateExpression:
          "SET #name = :name, plantId = :plantId, dailySalary = :salary",
        ExpressionAttributeNames: {
          "#name": "name",
        },
        ExpressionAttributeValues: {
          ":name": body.name,
          ":plantId": body.plantId,
          ":salary": Number(body.dailySalary),
        },
      })
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PUT Employee error:", err);
    return NextResponse.json(
      { error: "Failed to update employee" },
      { status: 500 }
    );
  }
}

/* ============== DELETE EMPLOYEE ============== */
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get("employeeId");

    if (!employeeId) {
      return NextResponse.json(
        { error: "employeeId required" },
        { status: 400 }
      );
    }

    await db.send(
      new DeleteCommand({
        TableName: TABLE,
        Key: { employeeId },
      })
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE Employee error:", err);
    return NextResponse.json(
      { error: "Failed to delete employee" },
      { status: 500 }
    );
  }
}

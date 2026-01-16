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

const TABLE = "Employees";

/* ===============================
   GET /api/employees
================================ */
export async function GET() {
  try {
    const result = await db.send(
      new ScanCommand({
        TableName: TABLE,
        Limit: 500,
      })
    );

    return NextResponse.json(result.Items ?? []);
  } catch (err) {
    console.error("GET Employees error:", err);
    return NextResponse.json(
      { error: "Failed to fetch employees" },
      { status: 500 }
    );
  }
}

/* ===============================
   POST /api/employees
================================ */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, plantId, dailySalary } = body;

    if (!name || !plantId || dailySalary === undefined) {
      return NextResponse.json(
        { error: "name, plantId, dailySalary required" },
        { status: 400 }
      );
    }

    const salary = Number(dailySalary);
    if (Number.isNaN(salary) || salary <= 0) {
      return NextResponse.json(
        { error: "dailySalary must be a valid number" },
        { status: 400 }
      );
    }

    const item = {
      employeeId: `EMP#${randomUUID()}`,
      name,
      plantId,
      dailySalary: salary,
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

/* ===============================
   PUT /api/employees
================================ */
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { searchParams } = new URL(req.url);

    // ✅ FIX: read employeeId from query OR body
    const employeeId =
      searchParams.get("employeeId") || body.employeeId;

    const { name, plantId, dailySalary } = body;

    if (!employeeId || !name) {
      return NextResponse.json(
        { error: "employeeId and name required" },
        { status: 400 }
      );
    }

    const salary =
      dailySalary !== undefined ? Number(dailySalary) : undefined;

    const updateParts: string[] = ["#name = :name"];
    const values: any = { ":name": name };
    const names: any = { "#name": "name" };

    if (plantId) {
      updateParts.push("plantId = :plantId");
      values[":plantId"] = plantId;
    }

    if (salary !== undefined && !Number.isNaN(salary)) {
      updateParts.push("dailySalary = :salary");
      values[":salary"] = salary;
    }

    const result = await db.send(
      new UpdateCommand({
        TableName: TABLE,
        Key: { employeeId },
        UpdateExpression: `SET ${updateParts.join(", ")}`,
        ExpressionAttributeNames: names,
        ExpressionAttributeValues: values,
        ReturnValues: "ALL_NEW",
      })
    );

    return NextResponse.json(result.Attributes);
  } catch (err) {
    console.error("PUT Employee error:", err);
    return NextResponse.json(
      { error: "Failed to update employee" },
      { status: 500 }
    );
  }
}

/* ===============================
   DELETE /api/employees
================================ */
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

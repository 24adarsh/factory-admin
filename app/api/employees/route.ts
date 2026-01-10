export const runtime = "nodejs";
import { NextResponse } from 'next/server';
import db from '@/lib/dynamodb';
import {
  ScanCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
} from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'crypto';

const TABLE = 'Employees';

/* ============== GET ALL EMPLOYEES ============== */
export async function GET() {
  try {
    const result = await db.send(new ScanCommand({ TableName: TABLE }));
    return NextResponse.json(result.Items || []);
  } catch (err) {
    console.error('GET Employees error:', err);
    const details = err instanceof Error ? err.message : String(err);
    const body = process.env.NODE_ENV === 'production'
      ? { error: 'Failed to fetch employees' }
      : { error: 'Failed to fetch employees', details };
    return NextResponse.json(body, { status: 500 });
  }
}

/* ============== CREATE EMPLOYEE ============== */
export async function POST(req: Request) {
  try {
    const text = await req.text();
    let body: any;
    try {
      body = text ? JSON.parse(text) : {};
    } catch (parseErr: any) {
      console.error('POST Employee parse error, raw body:', text);
      return NextResponse.json({ error: 'Invalid JSON', details: parseErr?.message, raw: text?.slice(0,1000) }, { status: 400 });
    }

    if (!body.name || !body.plantId || !body.dailySalary) {
      return NextResponse.json({ error: 'name, plantId, dailySalary required' }, { status: 400 });
    }

    const employeeId = `EMP#${randomUUID()}`;
    const createdAt = new Date().toISOString();
    const salary = Number(body.dailySalary);

    const item = {
      employeeId,
      name: body.name,
      plantId: body.plantId,
      dailySalary: salary,
      createdAt,
    };

    await db.send(new PutCommand({ TableName: TABLE, Item: item }));

    return NextResponse.json(item);
  } catch (err) {
    console.error('POST Employee error:', err);
    const details = err instanceof Error ? err.message : String(err);
    const body = process.env.NODE_ENV === 'production'
      ? { error: 'Failed to create employee' }
      : { error: 'Failed to create employee', details };
    return NextResponse.json(body, { status: 500 });
  }
}

/* ============== UPDATE EMPLOYEE ============== */
export async function PUT(req: Request) {
  try {
    const text = await req.text();
    let body: any;
    try {
      body = text ? JSON.parse(text) : {};
    } catch (parseErr: any) {
      console.error('PUT Employee parse error, raw body:', text);
      return NextResponse.json({ error: 'Invalid JSON', details: parseErr?.message, raw: text?.slice(0,1000) }, { status: 400 });
    }

    if (!body.employeeId || !body.name) {
      return NextResponse.json({ error: 'employeeId and name required' }, { status: 400 });
    }

    const salary = Number(body.dailySalary || 0);

    await db.send(new UpdateCommand({
      TableName: TABLE,
      Key: { employeeId: body.employeeId },
      UpdateExpression: 'SET #name = :name, plantId = :plantId, dailySalary = :salary',
      ExpressionAttributeNames: { '#name': 'name' },
      ExpressionAttributeValues: {
        ':name': body.name,
        ':plantId': body.plantId,
        ':salary': salary,
      },
    }));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('PUT Employee error:', err);
    const details = err instanceof Error ? err.message : String(err);
    const body = process.env.NODE_ENV === 'production'
      ? { error: 'Failed to update employee' }
      : { error: 'Failed to update employee', details };
    return NextResponse.json(body, { status: 500 });
  }
}

/* ============== DELETE EMPLOYEE ============== */
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get('employeeId');

    if (!employeeId) {
      return NextResponse.json({ error: 'employeeId required' }, { status: 400 });
    }

    await db.send(new DeleteCommand({ TableName: TABLE, Key: { employeeId } }));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('DELETE Employee error:', err);
    const details = err instanceof Error ? err.message : String(err);
    const body = process.env.NODE_ENV === 'production'
      ? { error: 'Failed to delete employee' }
      : { error: 'Failed to delete employee', details };
    return NextResponse.json(body, { status: 500 });
  }
}


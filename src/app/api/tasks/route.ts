import { NextRequest, NextResponse } from 'next/server';
import { getAllTasks, createNewTask, updateTask, deleteTask, reorderTasks } from '@/lib/board';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const projectPath = searchParams.get('projectPath');

    if (!projectPath) {
        return NextResponse.json({ error: 'Missing projectPath' }, { status: 400 });
    }

    try {
        const tasks = getAllTasks(projectPath);
        return NextResponse.json({ tasks });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { projectPath, title, type, team, tags, customAttributes } = body;

    if (!projectPath || !title || !type) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    try {
        const filepath = createNewTask(projectPath, title, type, team, tags, customAttributes);
        return NextResponse.json({ filepath });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// Update task(s) — single update or bulk reorder
export async function PATCH(req: NextRequest) {
    const body = await req.json();

    // Bulk reorder: { action: 'reorder', items: [{ filepath, order }] }
    if (body.action === 'reorder' && Array.isArray(body.items)) {
        try {
            reorderTasks(body.items);
            return NextResponse.json({ success: true });
        } catch (err: any) {
            return NextResponse.json({ error: err.message }, { status: 500 });
        }
    }

    // Single update
    const { filepath, ...updates } = body;
    if (!filepath) {
        return NextResponse.json({ error: 'Missing filepath' }, { status: 400 });
    }

    try {
        const newPath = updateTask(filepath, updates);
        return NextResponse.json({ success: true, filepath: newPath });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const filepath = searchParams.get('filepath');

    if (!filepath) {
        return NextResponse.json({ error: 'Missing filepath' }, { status: 400 });
    }

    try {
        deleteTask(filepath);
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

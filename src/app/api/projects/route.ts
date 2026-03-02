import { NextRequest, NextResponse } from 'next/server';
import { getConfig, addProject, removeProject, setActiveProject, updateProject } from '@/lib/config';

export async function GET() {
    const config = getConfig();
    return NextResponse.json(config);
}

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { action, ...data } = body;

    if (action === 'add') {
        const newConfig = addProject(data.path, data.name);
        return NextResponse.json(newConfig);
    }

    if (action === 'update') {
        const newConfig = updateProject(data.id, data.name);
        return NextResponse.json(newConfig);
    }

    if (action === 'remove') {
        const newConfig = removeProject(data.id);
        return NextResponse.json(newConfig);
    }

    if (action === 'setActive') {
        const newConfig = setActiveProject(data.id);
        return NextResponse.json(newConfig);
    }

    if (action === 'updateSettings') {
        const { updateSettings } = await import('@/lib/config');
        const newConfig = updateSettings(data.settings);
        return NextResponse.json(newConfig);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}

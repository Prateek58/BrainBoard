import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    let dirPath = searchParams.get('path') || os.homedir();

    // Resolve ~ to home dir
    if (dirPath.startsWith('~')) {
        dirPath = path.join(os.homedir(), dirPath.slice(1));
    }

    try {
        if (!fs.existsSync(dirPath)) {
            return NextResponse.json({ error: 'Path not found' }, { status: 404 });
        }

        const stat = fs.statSync(dirPath);
        if (!stat.isDirectory()) {
            return NextResponse.json({ error: 'Not a directory' }, { status: 400 });
        }

        const entries = fs.readdirSync(dirPath, { withFileTypes: true });
        const directories = entries
            .filter(e => e.isDirectory() && !e.name.startsWith('.'))
            .map(e => ({
                name: e.name,
                path: path.join(dirPath, e.name),
            }))
            .sort((a, b) => a.name.localeCompare(b.name));

        const parentPath = path.dirname(dirPath);

        return NextResponse.json({
            current: dirPath,
            parent: parentPath !== dirPath ? parentPath : null,
            directories,
            hasBrainFolder: fs.existsSync(path.join(dirPath, 'brain')),
        });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

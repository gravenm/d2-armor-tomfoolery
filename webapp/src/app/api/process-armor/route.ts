import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import Papa from 'papaparse';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const weights = formData.get('weights') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }

    const tempFilePath = path.join(process.cwd(), '..', 'destiny-armor.csv');
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(tempFilePath, buffer);

    const command = weights ? `python src/main.py --weights ${Buffer.from(weights).toString('base64')}` : 'python src/main.py';

    const results = await new Promise<any>((resolve, reject) => {
      exec(command, { cwd: path.join(process.cwd(), '..') }, (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
          return reject(new Error(`Error executing Python script: ${stderr}`));
        }
        try {
          const jsonData = JSON.parse(stdout);
          resolve(jsonData);
        } catch (e) {
          reject(new Error('Failed to parse JSON from Python script.'));
        }
      });
    });

    await fs.unlink(tempFilePath);

    return NextResponse.json(results);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to process armor data.' }, { status: 500 });
  }
}

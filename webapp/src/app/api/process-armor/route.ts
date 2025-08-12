import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import Papa from 'papaparse';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }

    const tempFilePath = path.join(process.cwd(), '..', 'destiny-armor.csv');
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(tempFilePath, buffer);

    await new Promise<void>((resolve, reject) => {
      exec('python src/main.py', { cwd: path.join(process.cwd(), '..') }, (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
          return reject(new Error(`Error executing Python script: ${stderr}`));
        }
        resolve();
      });
    });

    const results: Record<string, any[]> = {};
    const classNames = ['Hunter', 'Titan', 'Warlock']; 

    for (const className of classNames) {
        const outputFileName = `${className}-weighted.csv`;
        const outputFilePath = path.join(process.cwd(), '..', outputFileName);
        try {
            const csvData = await fs.readFile(outputFilePath, 'utf-8');
            const parsed = Papa.parse(csvData, { header: true, dynamicTyping: true });
            results[className] = parsed.data.filter((row: any) => row.Id !== null);
            await fs.unlink(outputFilePath);
        } catch (error) {
            // Ignore if a file for a class doesn't exist
        }
    }

    await fs.unlink(tempFilePath);

    return NextResponse.json(results);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to process armor data.' }, { status: 500 });
  }
}

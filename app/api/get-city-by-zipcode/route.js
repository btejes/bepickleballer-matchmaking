import { NextResponse } from 'next/server';
import xlsx from 'xlsx';
import path from 'path';
import fs from 'fs';
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });

const findCityByZipCode = async (filePath, zipCode) => {
  console.log(`Reading Excel file from path: ${filePath}`);
  try {
    if (!fs.existsSync(filePath)) {
      console.error(`File does not exist at path: ${filePath}`);
      return `Error: File does not exist at path: ${filePath}`;
    }

    console.log(`File exists at path: ${filePath}`);
    const fileBuffer = fs.readFileSync(filePath);
    console.log(`File buffer read successfully: ${fileBuffer.length} bytes`);
    
    const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    console.log(`Sheet name found: ${sheetName}`);
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
    console.log(`First few rows of JSON data: ${JSON.stringify(jsonData.slice(0, 5))}`);
    const headers = jsonData[0];
    console.log(`Headers: ${headers}`);
    const zipColumnIndex = headers.indexOf('PHYSICAL ZIP');
    const cityColumnIndex = headers.indexOf('PHYSICAL CITY');

    if (zipColumnIndex === -1 || cityColumnIndex === -1) {
      throw new Error('Specified columns not found in the Excel file');
    }

    console.log(`Zip Column Index: ${zipColumnIndex}, City Column Index: ${cityColumnIndex}`);

    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i];
      if (row[zipColumnIndex] == zipCode) {
        console.log(`Matching row found: ${JSON.stringify(row)}`);
        return row[cityColumnIndex];
      }
    }

    console.log(`No matching city found for ZIP code: ${zipCode}`);
    return null;
  } catch (error) {
    console.error(`Error processing Excel file: ${error.message}`);
    return `Error: ${error.message}`;
  }
};

export async function POST(request) {
  console.log('POST request received');
  try {
    const { zipCode } = await request.json();
    console.log(`ZIP code received: ${zipCode}`);

    if (!zipCode) {
      console.log('ZIP code is missing');
      return NextResponse.json({ error: 'ZIP code is required' }, { status: 400 });
    }

    const filePath = path.resolve('library/US_Zipcode_Cities.xlsx'); // Adjusted path based on filesystem
    console.log(`Using file path: ${filePath}`);
    const city = await findCityByZipCode(filePath, zipCode);

    if (city && !city.startsWith('Error')) {
      console.log(`City found: ${city}`);
      return NextResponse.json({ city }, { status: 200 });
    } else if (city && city.startsWith('Error')) {
      console.error(`Error found in city lookup: ${city}`);
      return NextResponse.json({ error: city }, { status: 500 });
    } else {
      console.log(`City not found for ZIP code: ${zipCode}`);
      return NextResponse.json({ error: 'City not found for the provided ZIP code' }, { status: 404 });
    }
  } catch (error) {
    console.error(`Error handling POST request: ${error.message}`);
    return NextResponse.json({ error: `Error: ${error.message}` }, { status: 500 });
  }
}

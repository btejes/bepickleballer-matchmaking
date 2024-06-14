import { NextResponse } from 'next/server';
import fastcsv from 'fast-csv';
import path from 'path';
import fs from 'fs';
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });

const findCityByZipCode = async (filePath, zipCode) => {
  console.log(`Reading CSV file from path: ${filePath}`);
  try {
    if (!fs.existsSync(filePath)) {
      console.error(`File does not exist at path: ${filePath}`);
      return `Error: File does not exist at path: ${filePath}`;
    }

    console.log(`File exists at path: ${filePath}`);

    const data = await new Promise((resolve, reject) => {
      const results = [];
      fs.createReadStream(filePath)
        .pipe(fastcsv.parse({ headers: true }))
        .on('data', (row) => results.push(row))
        .on('end', () => resolve(results))
        .on('error', (error) => reject(error));
    });

    console.log(`CSV file read successfully`);
    console.log(`First few rows of JSON data: ${JSON.stringify(data.slice(0, 5))}`);
    
    for (let row of data) {
      if (row['PHYSICAL ZIP'] == zipCode) {
        console.log(`Matching row found: ${JSON.stringify(row)}`);
        return row['PHYSICAL CITY'];
      }
    }

    console.log(`No matching city found for ZIP code: ${zipCode}`);
    return null;
  } catch (error) {
    console.error(`Error processing CSV file: ${error.message}`);
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

    const filePath = path.resolve('library/US_Zipcode_Cities.csv'); // Adjusted path based on filesystem
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

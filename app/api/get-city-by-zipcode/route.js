import { NextResponse } from 'next/server';
import csv from 'csv-parser';
import path from 'path';
import fs from 'fs';
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });

// Function to read and parse the CSV file
const readCSV = async (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => results.push(row))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
};

// Function to perform binary search on the sorted data
const binarySearch = (data, zipCode) => {
  let left = 0;
  let right = data.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const currentZip = data[mid]['PHYSICAL ZIP'];

    if (currentZip === zipCode) {
      return data[mid]['PHYSICAL CITY'];
    } else if (currentZip < zipCode) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  return null;
};

const findCityByZipCode = async (filePath, zipCode) => {
  // console.log(`Reading CSV file from path: ${filePath}`);
  try {
    if (!fs.existsSync(filePath)) {
      console.error(`File does not exist at path: ${filePath}`);
      return `Error: File does not exist at path: ${filePath}`;
    }

    // console.log(`File exists at path: ${filePath}`);

    const data = await readCSV(filePath);

    // console.log(`CSV file read successfully`);
    // console.log(`First few rows of JSON data: ${JSON.stringify(data.slice(0, 5))}`);
    
    const city = binarySearch(data, zipCode);

    if (city) {
      // console.log(`Matching row found: ${city}`);
      return city;
    } else {
      // console.log(`No matching city found for ZIP code: ${zipCode}`);
      return null;
    }
  } catch (error) {
    console.error(`Error processing CSV file: ${error.message}`);
    return `Error: ${error.message}`;
  }
};

export async function POST(request) {
  // console.log('POST request received');
  try {
    const { zipCode } = await request.json();
    // console.log(`ZIP code received: ${zipCode}`);

    if (!zipCode) {
      // console.log('ZIP code is missing');
      return NextResponse.json({ error: 'ZIP code is required' }, { status: 400 });
    }

    const filePath = path.resolve('library/US_Zipcode_Cities.csv'); // Adjusted path based on filesystem
    // console.log(`Using file path: ${filePath}`);
    const city = await findCityByZipCode(filePath, zipCode);

    if (city && !city.startsWith('Error')) {
      // console.log(`City found: ${city}`);
      return NextResponse.json({ city }, { status: 200 });
    } else if (city && city.startsWith('Error')) {
      console.error(`Error found in city lookup: ${city}`);
      return NextResponse.json({ error: city }, { status: 500 });
    } else {
      // console.log(`City not found for ZIP code: ${zipCode}`);
      return NextResponse.json({ error: 'City not found for the provided ZIP code' }, { status: 404 });
    }
  } catch (error) {
    console.error(`Error handling POST request: ${error.message}`);
    return NextResponse.json({ error: `Error: ${error.message}` }, { status: 500 });
  }
}

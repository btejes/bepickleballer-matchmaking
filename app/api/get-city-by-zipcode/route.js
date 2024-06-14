import { NextResponse } from 'next/server';
import xlsx from 'xlsx';

const findCityByZipCode = (filePath, zipCode) => {
  try {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
    const headers = jsonData[0];
    const zipColumnIndex = headers.indexOf('PHYSICAL ZIP');
    const cityColumnIndex = headers.indexOf('PHYSICAL CITY');

    if (zipColumnIndex === -1 || cityColumnIndex === -1) {
      throw new Error('Specified columns not found in the Excel file');
    }

    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i];
      if (row[zipColumnIndex] == zipCode) {
        return row[cityColumnIndex];
      }
    }

    return null;
  } catch (error) {
    return `Error: ${error.message}`;
  }
};

export async function POST(request) {
  try {
    const { zipCode } = await request.json();

    if (!zipCode) {
      return NextResponse.json({ error: 'ZIP code is required' }, { status: 400 });
    }

    const filePath = 'US_Zipcode_Cities.xlsx'; // Path to your .xlsx file in the root folder
    const city = findCityByZipCode(filePath, zipCode);

    if (city && !city.startsWith('Error')) {
      return NextResponse.json({ city }, { status: 200 });
    } else {
      return NextResponse.json({ error: 'City not found for the provided ZIP code' }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({ error: `Error: ${error.message}` }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { parseProductFile } from "@/lib/bulk-upload/parser";
import type { ProductUploadRow, RowError } from "./types";
import { validateRow } from "./validator";

export const POST = async (request: Request) => {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const rows = parseProductFile(buffer) as ProductUploadRow[];
    const seenSkus = new Set<string>();

    const validRows: ProductUploadRow[] = [];
    const invalidRows: ProductUploadRow[] = [];
    const rowErrors: RowError[] = [];

    rows.forEach((row, index) => {
      const rowNumber = index + 2;
      const validationResult = validateRow(row, rowNumber, seenSkus);

      if (validationResult.isValid) {
        validRows.push(row);
      } else {
        invalidRows.push(row);
        rowErrors.push(...validationResult.errors);
      }
    });

    console.log("Total records processed:", rows.length);
    console.log("Valid records:", validRows.length);
    console.log("Invalid records:", invalidRows.length);
    console.log("Errors:");
    rowErrors.forEach((error) => {
      console.log(`Row ${error.rowNumber} - ${error.field} - ${error.issue}`);
    });

    return NextResponse.json({
      message: "File parsed and validated successfully",
      totalRecordsProcessed: rows.length,
      validRecords: validRows.length,
      invalidRecords: invalidRows.length,
      errors: rowErrors,
      validRows,
    });
  } catch (error) {
    console.error("Bulk upload parse/validate error:", error);

    return NextResponse.json(
      { error: "Failed to process file" },
      { status: 500 },
    );
  }
};

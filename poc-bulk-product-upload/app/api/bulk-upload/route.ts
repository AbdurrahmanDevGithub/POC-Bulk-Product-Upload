import { NextResponse } from "next/server";
import { parseProductFile } from "@/lib/bulk-upload/parser";

export const POST = async (request: Request) => {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "File is required" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const rows = parseProductFile(buffer);

    console.log("Parsed rows:");
    console.log(rows);

    return NextResponse.json({
      message: "File parsed successfully",
      totalRows: rows.length,
      rows,
    });
  } catch (error) {
    console.error("Bulk upload parse error:", error);

    return NextResponse.json(
      { error: "Failed to parse file" },
      { status: 500 }
    );
  }
};
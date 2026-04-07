import * as XLSX from "xlsx";
import Papa from "papaparse";

const isCsvBuffer = (buffer: Buffer): boolean => {
  const hex = buffer.slice(0, 4).toString("hex").toLowerCase();
  const isExcel = hex.startsWith("d0cf") || hex.startsWith("504b");
  return !isExcel;
};

export const parseProductFile = (buffer: Buffer) => {
  if (isCsvBuffer(buffer)) {
    const content = buffer.toString("utf-8");

    const result = Papa.parse(content, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
    });

    return result.data;
  }

  const workbook = XLSX.read(buffer, { type: "buffer" });
  const firstSheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[firstSheetName];

  return XLSX.utils.sheet_to_json(sheet, { defval: "", raw: false });
};
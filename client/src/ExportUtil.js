import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

export const exportToPDF = (data, fileName, title) => {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text(title, 14, 22);

  doc.setFontSize(11);

  const columns = Object.keys(data[0]);
  const rows = data.map((obj) => Object.values(obj));

  doc.autoTable({
    head: [columns],
    body: rows,
    startY: 40,
    margin: { top: 30 },
    styles: { overflow: "linebreak", cellWidth: "wrap" },
    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: 30 },
      2: { cellWidth: 30 },
      3: { cellWidth: 30 },
    },
  });

  doc.save(fileName);
};

export const exportToExcel = (data, fileName, sheetName) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();

  const columnWidths = [{ wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 15 }];
  worksheet["!cols"] = columnWidths;

  const headerCellStyle = {
    font: { bold: true },
    alignment: { horizontal: "center" },
  };

  const headerRange = XLSX.utils.decode_range(worksheet["!ref"]);
  for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
    worksheet[cellAddress].s = headerCellStyle;
  }

  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, fileName);
};

export const exportData = (data, fileName, title, format) => {
  if (format === "pdf") {
    exportToPDF(data, `${fileName}.pdf`, title);
  } else if (format === "excel") {
    exportToExcel(data, `${fileName}.xlsx`, title);
  }
};

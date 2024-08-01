import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

export const exportData = (data, fileName, title, format, exportType) => {
  if (format === "pdf") {
    exportToPDFDetailed(data, `${fileName}.pdf`, title, exportType);
  } else if (format === "excel") {
    exportToExcelDetailed(data, `${fileName}.xlsx`, title, exportType);
  }
};

function exportToPDFDetailed(data, fileName, title, exportType) {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text(title, 14, 22);
  doc.setFontSize(11);

  let yOffset = 40;
  const pageHeight = doc.internal.pageSize.height;

  data.forEach((budget, index) => {
    if (yOffset > pageHeight - 60) {
      doc.addPage();
      yOffset = 20;
    }

    doc.text(`Budget: ${budget.Name}`, 14, yOffset);
    yOffset += 10;

    doc.autoTable({
      head: [["Amount", "Spent", "Left"]],
      body: [[budget.Amount, budget.Spent, budget.Left]],
      startY: yOffset,
      margin: { left: 14 },
    });
    yOffset = doc.lastAutoTable.finalY + 10;

    if (exportType === "detailed" && budget.Expenses) {
      if (yOffset > pageHeight - 60) {
        doc.addPage();
        yOffset = 20;
      }

      doc.autoTable({
        head: [["Expense", "Amount", "Date"]],
        body: budget.Expenses.map((exp) => [exp.Name, exp.Amount, exp.Date]),
        startY: yOffset,
        margin: { left: 14 },
      });
      yOffset = doc.lastAutoTable.finalY + 20;
    }
  });

  doc.save(fileName);
}

function exportToExcelDetailed(data, fileName, title, exportType) {
  const wb = XLSX.utils.book_new();

  if (exportType === "basic") {
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, title);
  } else {
    data.forEach((budget, index) => {
      const wsData = [
        ["Budget", budget.Name],
        ["Amount", "Spent", "Left"],
        [budget.Amount, budget.Spent, budget.Left],
        [],
      ];

      if (budget.Expenses) {
        wsData.push(["Expenses"]);
        wsData.push(["Name", "Amount", "Date"]);
        budget.Expenses.forEach((exp) => {
          wsData.push([exp.Name, exp.Amount, exp.Date]);
        });
      }

      const ws = XLSX.utils.aoa_to_sheet(wsData);
      XLSX.utils.book_append_sheet(wb, ws, `Budget ${index + 1}`);
    });
  }

  XLSX.writeFile(wb, fileName);
}

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

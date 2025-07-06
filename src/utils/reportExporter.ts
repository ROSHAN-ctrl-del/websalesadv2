import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export interface ReportData {
  title: string;
  data: any[];
  columns: string[];
  summary?: Record<string, any>;
}

export const exportToCSV = (reportData: ReportData) => {
  const { title, data, columns } = reportData;
  
  // Create CSV content
  const csvContent = [
    columns.join(','),
    ...data.map(row => 
      columns.map(col => {
        const value = row[col] || '';
        // Escape commas and quotes
        return typeof value === 'string' && (value.includes(',') || value.includes('"'))
          ? `"${value.replace(/"/g, '""')}"`
          : value;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `${title.replace(/\s+/g, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.csv`);
};

export const exportToExcel = (reportData: ReportData) => {
  const { title, data, columns, summary } = reportData;
  
  const workbook = XLSX.utils.book_new();
  
  // Main data sheet
  const worksheet = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
  
  // Summary sheet if provided
  if (summary) {
    const summaryData = Object.entries(summary).map(([key, value]) => ({
      Metric: key,
      Value: value
    }));
    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
  }
  
  XLSX.writeFile(workbook, `${title.replace(/\s+/g, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.xlsx`);
};

export const exportToPDF = (reportData: ReportData) => {
  const { title, data, columns, summary } = reportData;
  
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(20);
  doc.text(title, 20, 20);
  
  // Date
  doc.setFontSize(12);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 35);
  
  // Summary if provided
  let yPosition = 50;
  if (summary) {
    doc.setFontSize(14);
    doc.text('Summary', 20, yPosition);
    yPosition += 10;
    
    Object.entries(summary).forEach(([key, value]) => {
      doc.setFontSize(10);
      doc.text(`${key}: ${value}`, 20, yPosition);
      yPosition += 7;
    });
    yPosition += 10;
  }
  
  // Table
  const tableData = data.map(row => columns.map(col => row[col] || ''));
  
  (doc as any).autoTable({
    head: [columns],
    body: tableData,
    startY: yPosition,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [59, 130, 246] }
  });
  
  doc.save(`${title.replace(/\s+/g, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.pdf`);
};
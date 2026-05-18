export interface CSVColumn {
  header: string;
  accessor: (row: Record<string, unknown>) => string;
}

export function exportToCSV(
  columns: CSVColumn[],
  rows: Record<string, unknown>[],
  filename: string
) {
  const escape = (val: string) => `"${val.replace(/"/g, '""')}"`;

  const headerLine = columns.map((c) => escape(c.header)).join(",");

  const dataLines = rows
    .map((row) =>
      columns
        .map((c) => escape(c.accessor(row)))
        .join(",")
    )
    .join("\n");

  const csv = "﻿" + headerLine + "\n" + dataLines;

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const today = new Date().toISOString().slice(0, 10);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}-${today}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

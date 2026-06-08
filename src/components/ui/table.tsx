import * as React from "react";
import { cn } from "@/src/lib/utils";

/**
 * 表格容器
 */
const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table
      ref={ref}
      className={cn("w-full caption-bottom text-sm", className)}
      {...props}
    />
  </div>
));
Table.displayName = "Table";

/**
 * 表格头部
 */
const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn("[&_tr]:border-b border-navy-200 bg-navy-50/50", className)}
    {...props}
  />
));
TableHeader.displayName = "TableHeader";

/**
 * 表格主体
 */
const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
));
TableBody.displayName = "TableBody";

/**
 * 表格行
 */
const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b border-navy-100 transition-colors hover:bg-navy-50/30 data-[state=selected]:bg-navy-50",
      className
    )}
    {...props}
  />
));
TableRow.displayName = "TableRow";

/**
 * 表格数据单元格
 */
const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn("p-4 align-middle text-navy-700", className)}
    {...props}
  />
));
TableCell.displayName = "TableCell";

/**
 * 表格表头单元格
 */
const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "p-4 align-middle font-semibold text-navy-600 text-left",
      className
    )}
    {...props}
  />
));
TableHead.displayName = "TableHead";

export { Table, TableHeader, TableBody, TableRow, TableCell, TableHead };

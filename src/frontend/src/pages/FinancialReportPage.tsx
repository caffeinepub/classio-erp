import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Building2,
  Loader2,
  Printer,
  Scale,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useMemo, useState } from "react";
import { PageHeader } from "../components/shared";
import {
  useAllExpenses,
  useAllPayments,
  useAllPayrollRecords,
  useAllStudentInvoices,
} from "../hooks/useQueries";

type Period = "month" | "year" | "all";

const fmt = (n: bigint | number): string =>
  `\u20b9${Number(n).toLocaleString("en-IN")}`;

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/**
 * Convert a stored timestamp to a JS Date.
 * The backend (Time.now()) stores nanoseconds (>1e15 for post-2001 dates).
 * The frontend (Date.now() / getTime()) stores milliseconds (~1.7e12).
 * We detect which unit by checking if the value exceeds 1e13 ms (year 2286),
 * which is a safe threshold: anything bigger must be nanoseconds.
 */
function toDate(ts: bigint | number): Date {
  const n = Number(ts);
  // If value > 1e15 it's nanoseconds (IC backend Time.now())
  if (n > 1e15) return new Date(n / 1_000_000);
  // Otherwise treat as milliseconds (frontend Date.now())
  return new Date(n);
}

function isInPeriod(date: Date, period: Period): boolean {
  const now = new Date();
  if (period === "all") return true;
  if (period === "month") {
    return (
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth()
    );
  }
  // year
  return date.getFullYear() === now.getFullYear();
}

function periodLabel(period: Period): string {
  const now = new Date();
  if (period === "month")
    return `${MONTHS[now.getMonth()]} ${now.getFullYear()}`;
  if (period === "year") return `FY ${now.getFullYear()}`;
  return "All Time";
}

interface SummaryCardProps {
  label: string;
  value: number;
  icon: React.ElementType;
  colorClass: string;
  borderClass: string;
}

function SummaryCard({
  label,
  value,
  icon: Icon,
  colorClass,
  borderClass,
}: SummaryCardProps) {
  return (
    <Card className={`shadow-sm border-l-4 ${borderClass} print:shadow-none`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Icon className={`h-4 w-4 ${colorClass}`} />
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className={`text-2xl font-bold ${colorClass}`}>{fmt(value)}</p>
      </CardContent>
    </Card>
  );
}

export default function FinancialReportPage() {
  const [period, setPeriod] = useState<Period>("year");

  const { data: allExpenses = [], isLoading: loadingExpenses } =
    useAllExpenses();
  const { data: allPayments = [], isLoading: loadingPayments } =
    useAllPayments();
  const { data: allInvoices = [], isLoading: loadingInvoices } =
    useAllStudentInvoices();
  const { data: allPayroll = [], isLoading: loadingPayroll } =
    useAllPayrollRecords();

  const isLoading =
    loadingExpenses || loadingPayments || loadingInvoices || loadingPayroll;

  // ── Filtered payments ────────────────────────────────────────────────────
  const filteredPayments = useMemo(() => {
    return (allPayments as any[]).filter((p: any) =>
      isInPeriod(toDate(p.paymentDate), period),
    );
  }, [allPayments, period]);

  // ── Filtered expenses ────────────────────────────────────────────────────
  const filteredExpenses = useMemo(() => {
    return (allExpenses as any[]).filter((e: any) =>
      isInPeriod(toDate(e.date), period),
    );
  }, [allExpenses, period]);

  // ── Income calculations ──────────────────────────────────────────────────
  const totalIncome = useMemo(
    () =>
      filteredPayments.reduce(
        (sum: number, p: any) => sum + Number(p.amount),
        0,
      ),
    [filteredPayments],
  );

  // Payments grouped by month-year
  const paymentsByMonth = useMemo(() => {
    const map: Record<string, number> = {};
    for (const p of filteredPayments) {
      const d = toDate(p.paymentDate);
      const key = `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
      map[key] = (map[key] || 0) + Number(p.amount);
    }
    return Object.entries(map).sort((a, b) => {
      const [ma, ya] = [a[0].split(" ")[0], a[0].split(" ")[1]];
      const [mb, yb] = [b[0].split(" ")[0], b[0].split(" ")[1]];
      return (
        new Date(`${ma} 1 ${ya}`).getTime() -
        new Date(`${mb} 1 ${yb}`).getTime()
      );
    });
  }, [filteredPayments]);

  // ── Expense calculations ─────────────────────────────────────────────────
  const totalExpenses = useMemo(
    () =>
      filteredExpenses.reduce(
        (sum: number, e: any) => sum + Number(e.amount),
        0,
      ),
    [filteredExpenses],
  );

  const expenseByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    for (const e of filteredExpenses) {
      map[e.category] = (map[e.category] || 0) + Number(e.amount);
    }
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [filteredExpenses]);

  // ── P&L ─────────────────────────────────────────────────────────────────
  const netPnL = totalIncome - totalExpenses;
  const isProfit = netPnL >= 0;

  // ── Balance Sheet ────────────────────────────────────────────────────────
  const cashCollected = totalIncome;

  const outstandingReceivables = useMemo(() => {
    return (allInvoices as any[])
      .filter((inv: any) => inv.status === "unpaid" || inv.status === "overdue")
      .reduce((sum: number, inv: any) => sum + Number(inv.amount), 0);
  }, [allInvoices]);

  const unpaidSalaryObligations = useMemo(() => {
    return (allPayroll as any[])
      .filter((pr: any) => pr.isPaid === false)
      .reduce((sum: number, pr: any) => sum + Number(pr.netPay), 0);
  }, [allPayroll]);

  const totalAssets = cashCollected + outstandingReceivables;
  const totalLiabilities = unpaidSalaryObligations;
  const netEquity = totalAssets - totalLiabilities;

  const handlePrint = () => window.print();

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="print:hidden">
        <PageHeader
          title="P&L Report"
          description="Profit & Loss statement and Balance Sheet for your school"
          actions={
            <Button
              data-ocid="financial-report.print_button"
              onClick={handlePrint}
              className="gap-2 print:hidden"
              variant="outline"
            >
              <Printer className="h-4 w-4" />
              Print Report
            </Button>
          }
        />
      </div>

      {/* Print-only header */}
      <div className="hidden print:block mb-6">
        <h1 className="text-2xl font-bold">
          Classio ERP &#8212; Financial Report
        </h1>
        <p className="text-muted-foreground">Period: {periodLabel(period)}</p>
        <p className="text-xs text-muted-foreground">
          Generated: {new Date().toLocaleString("en-IN")}
        </p>
        <hr className="mt-3" />
      </div>

      {/* Period Filter */}
      <div
        className="flex gap-2 mb-6 print:hidden"
        data-ocid="financial-report.filter.tab"
      >
        {(["month", "year", "all"] as Period[]).map((p) => (
          <Button
            key={p}
            size="sm"
            variant={period === p ? "default" : "outline"}
            onClick={() => setPeriod(p)}
          >
            {p === "month"
              ? "This Month"
              : p === "year"
                ? "This Year"
                : "All Time"}
          </Button>
        ))}
        <Badge variant="secondary" className="ml-auto my-auto text-xs">
          {periodLabel(period)}
        </Badge>
      </div>

      {isLoading ? (
        <div
          className="flex items-center justify-center py-24"
          data-ocid="financial-report.loading_state"
        >
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-8">
          {/* ── Summary KPI Row ─────────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <SummaryCard
              label="Total Income"
              value={totalIncome}
              icon={TrendingUp}
              colorClass="text-emerald-600"
              borderClass="border-l-emerald-500"
            />
            <SummaryCard
              label="Total Expenses"
              value={totalExpenses}
              icon={TrendingDown}
              colorClass="text-destructive"
              borderClass="border-l-destructive"
            />
            <Card
              className={`shadow-sm border-l-4 print:shadow-none ${
                isProfit ? "border-l-emerald-500" : "border-l-destructive"
              }`}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  {isProfit ? (
                    <ArrowUpRight className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-destructive" />
                  )}
                  Net {isProfit ? "Profit" : "Loss"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p
                  className={`text-2xl font-bold ${
                    isProfit ? "text-emerald-600" : "text-destructive"
                  }`}
                >
                  {fmt(Math.abs(netPnL))}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* ── Section 1: Income / Revenue ─────────────────────────────── */}
          <section data-ocid="financial-report.section">
            <div className="flex items-center gap-2 mb-3">
              <Wallet className="h-5 w-5 text-emerald-600" />
              <h2 className="text-lg font-semibold">Income / Revenue</h2>
              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                {fmt(totalIncome)}
              </Badge>
            </div>
            <Card className="shadow-sm print:shadow-none">
              <CardContent className="p-0">
                <Table data-ocid="financial-report.table">
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead className="font-semibold">Month</TableHead>
                      <TableHead className="text-right font-semibold">
                        Amount Collected
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentsByMonth.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={2}
                          className="text-center py-8 text-muted-foreground text-sm"
                          data-ocid="financial-report.empty_state"
                        >
                          No payments recorded for this period
                        </TableCell>
                      </TableRow>
                    ) : (
                      paymentsByMonth.map(([month, amount], i) => (
                        <TableRow
                          key={month}
                          data-ocid={`financial-report.item.${i + 1}`}
                        >
                          <TableCell className="font-medium">{month}</TableCell>
                          <TableCell className="text-right text-emerald-600 font-semibold">
                            {fmt(amount)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                    {paymentsByMonth.length > 0 && (
                      <TableRow className="bg-emerald-50 dark:bg-emerald-950/20">
                        <TableCell className="font-bold">
                          Total Income
                        </TableCell>
                        <TableCell className="text-right font-bold text-emerald-600">
                          {fmt(totalIncome)}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </section>

          {/* ── Section 2: Expenses ─────────────────────────────────────── */}
          <section data-ocid="financial-report.section">
            <div className="flex items-center gap-2 mb-3">
              <TrendingDown className="h-5 w-5 text-destructive" />
              <h2 className="text-lg font-semibold">Expenses</h2>
              <Badge variant="destructive">{fmt(totalExpenses)}</Badge>
            </div>
            <Card className="shadow-sm print:shadow-none">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead className="font-semibold">Category</TableHead>
                      <TableHead className="text-right font-semibold">
                        Amount
                      </TableHead>
                      <TableHead className="text-right font-semibold">
                        % of Total
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenseByCategory.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          className="text-center py-8 text-muted-foreground text-sm"
                          data-ocid="financial-report.empty_state"
                        >
                          No expenses recorded for this period
                        </TableCell>
                      </TableRow>
                    ) : (
                      expenseByCategory.map(([cat, amount], i) => (
                        <TableRow
                          key={cat}
                          data-ocid={`financial-report.item.${i + 1}`}
                        >
                          <TableCell className="font-medium">
                            <span className="flex items-center gap-2">
                              {cat === "Salaries" && (
                                <Badge variant="secondary" className="text-xs">
                                  Auto
                                </Badge>
                              )}
                              {cat}
                            </span>
                          </TableCell>
                          <TableCell className="text-right text-destructive font-semibold">
                            {fmt(amount)}
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            {totalExpenses > 0
                              ? `${((amount / totalExpenses) * 100).toFixed(1)}%`
                              : "\u2014"}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                    {expenseByCategory.length > 0 && (
                      <TableRow className="bg-red-50 dark:bg-red-950/20">
                        <TableCell className="font-bold">
                          Total Expenses
                        </TableCell>
                        <TableCell className="text-right font-bold text-destructive">
                          {fmt(totalExpenses)}
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          100%
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </section>

          {/* ── Section 3: Profit & Loss Summary ────────────────────────── */}
          <section data-ocid="financial-report.section">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">
                Profit &amp; Loss Summary
              </h2>
            </div>
            <Card className="shadow-sm print:shadow-none">
              <CardContent className="pt-6">
                <div className="space-y-3 max-w-md">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total Income</span>
                    <span className="font-semibold text-emerald-600">
                      {fmt(totalIncome)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">
                      Total Expenses
                    </span>
                    <span className="font-semibold text-destructive">
                      (&#8722;) {fmt(totalExpenses)}
                    </span>
                  </div>
                  <Separator />
                  <div
                    className={`flex justify-between items-center p-3 rounded-lg ${
                      isProfit
                        ? "bg-emerald-50 dark:bg-emerald-950/30"
                        : "bg-red-50 dark:bg-red-950/30"
                    }`}
                    data-ocid="financial-report.panel"
                  >
                    <span className="font-bold text-base">
                      Net {isProfit ? "Profit" : "Loss"}
                    </span>
                    <span
                      className={`font-bold text-xl ${
                        isProfit ? "text-emerald-600" : "text-destructive"
                      }`}
                    >
                      {isProfit ? "+" : "\u2212"}
                      {fmt(Math.abs(netPnL))}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* ── Section 4: Balance Sheet ─────────────────────────────────── */}
          <section data-ocid="financial-report.section">
            <div className="flex items-center gap-2 mb-3">
              <Scale className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold">Balance Sheet Summary</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Assets */}
              <Card className="shadow-sm border-l-4 border-l-blue-400 print:shadow-none">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-blue-500" />
                    Assets
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Cash Collected (Fees)
                    </span>
                    <span className="font-medium">{fmt(cashCollected)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Outstanding Receivables
                    </span>
                    <span className="font-medium text-amber-600">
                      {fmt(outstandingReceivables)}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold">
                    <span>Total Assets</span>
                    <span className="text-blue-600">{fmt(totalAssets)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Liabilities + Equity */}
              <Card className="shadow-sm border-l-4 border-l-orange-400 print:shadow-none">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Scale className="h-4 w-4 text-orange-500" />
                    Liabilities &amp; Equity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Unpaid Salary Obligations
                    </span>
                    <span className="font-medium text-destructive">
                      {fmt(unpaidSalaryObligations)}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-sm">
                    <span>Total Liabilities</span>
                    <span className="text-orange-600">
                      {fmt(totalLiabilities)}
                    </span>
                  </div>
                  <Separator />
                  <div
                    className="flex justify-between font-bold p-2 rounded bg-blue-50 dark:bg-blue-950/30"
                    data-ocid="financial-report.panel"
                  >
                    <span>Net Equity</span>
                    <span
                      className={`text-lg ${
                        netEquity >= 0 ? "text-blue-600" : "text-destructive"
                      }`}
                    >
                      {fmt(netEquity)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Footer */}
          <div className="text-xs text-muted-foreground text-center py-4 print:block">
            Generated by Classio ERP &middot;{" "}
            {new Date().toLocaleString("en-IN")} &middot; Period:{" "}
            {periodLabel(period)}
          </div>
        </div>
      )}
    </div>
  );
}

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { EmptyState, PageHeader } from "../components/shared";
import { useLocalAuth } from "../hooks/useLocalAuth";
import {
  useAllAttendanceCorrections,
  useSubmitAttendanceCorrection,
} from "../hooks/useQueries";
import { bigIntToDateString, dateToBigInt } from "../utils/dateUtils";

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function formatDateLabel(date: Date): string {
  return date.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isFutureDay(date: Date, today: Date): boolean {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return d > t;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
  approved: "bg-green-100 text-green-800 border-green-300",
  rejected: "bg-red-100 text-red-800 border-red-300",
};

const REQUESTED_STATUS_COLORS: Record<string, string> = {
  Present: "bg-green-50 text-green-700 border-green-200",
  Absent: "bg-red-50 text-red-700 border-red-200",
  Late: "bg-yellow-50 text-yellow-700 border-yellow-200",
};

// --- Mini Calendar Component ---
interface MiniCalendarProps {
  selected: Date | null;
  onSelect: (date: Date) => void;
}

function MiniCalendar({ selected, onSelect }: MiniCalendarProps) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
  const startDayOfWeek = firstDayOfMonth.getDay(); // 0=Sun
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  // Prevent navigating beyond current month
  const isNextDisabled =
    viewYear > today.getFullYear() ||
    (viewYear === today.getFullYear() && viewMonth >= today.getMonth());

  // Build calendar grid: leading nulls for offset, then day numbers
  const leadingEmpties = Array.from({ length: startDayOfWeek }, (_, i) => ({
    type: "empty" as const,
    key: `empty-${viewYear}-${viewMonth}-${i}`,
  }));
  const dayItems = Array.from({ length: daysInMonth }, (_, i) => ({
    type: "day" as const,
    day: i + 1,
    key: `day-${viewYear}-${viewMonth}-${i + 1}`,
  }));
  const cells = [...leadingEmpties, ...dayItems];

  return (
    <div className="bg-white border border-border rounded-xl shadow-sm p-4 w-full max-w-sm">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={prevMonth}
          className="p-1.5 rounded-md hover:bg-muted transition-colors"
          aria-label="Previous month"
          data-ocid="my_attendance.calendar.pagination_prev"
        >
          <ChevronLeft className="h-4 w-4 text-muted-foreground" />
        </button>
        <span className="font-semibold text-sm text-foreground">
          {MONTHS[viewMonth]} {viewYear}
        </span>
        <button
          type="button"
          onClick={nextMonth}
          disabled={isNextDisabled}
          className="p-1.5 rounded-md hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Next month"
          data-ocid="my_attendance.calendar.pagination_next"
        >
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS_OF_WEEK.map((d) => (
          <div
            key={d}
            className="text-center text-xs font-medium text-muted-foreground py-1"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((cell) => {
          if (cell.type === "empty") {
            return <div key={cell.key} className="h-9" />;
          }

          const { day, key } = cell;
          const cellDate = new Date(viewYear, viewMonth, day);
          const isToday = isSameDay(cellDate, today);
          const isSelected = selected ? isSameDay(cellDate, selected) : false;
          const isFuture = isFutureDay(cellDate, today);

          return (
            <button
              key={key}
              type="button"
              disabled={isFuture}
              onClick={() => onSelect(cellDate)}
              data-ocid="my_attendance.calendar.canvas_target"
              className={[
                "h-9 w-9 mx-auto flex items-center justify-center rounded-full text-sm transition-colors",
                isFuture
                  ? "text-muted-foreground/40 cursor-not-allowed"
                  : "cursor-pointer hover:bg-primary/10",
                isSelected
                  ? "bg-primary text-primary-foreground font-semibold shadow-sm hover:bg-primary"
                  : "",
                isToday && !isSelected
                  ? "ring-2 ring-primary ring-offset-1 font-semibold text-primary"
                  : "",
                !isSelected && !isToday && !isFuture ? "text-foreground" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// --- Main Page ---
export default function MyAttendancePage() {
  const { user } = useLocalAuth();
  const staffId = user?.username ?? "";

  const { data: corrections, isLoading } = useAllAttendanceCorrections();
  const submitCorrection = useSubmitAttendanceCorrection();

  const myCorrections = (corrections ?? []).filter(
    (c) => c.staffId === staffId,
  );

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [notes, setNotes] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState<Date | null>(null);

  const handleSubmit = async () => {
    if (!selectedDate) {
      toast.error("Please select a date");
      return;
    }
    if (!staffId) {
      toast.error("User not found");
      return;
    }
    try {
      await submitCorrection.mutateAsync({
        staffId,
        date: dateToBigInt(selectedDate),
        requestedStatus: "Present",
        reason: notes,
      });
      setSubmitSuccess(selectedDate);
      setNotes("");
      toast.success("Attendance submitted for School Admin approval");
    } catch {
      toast.error("Failed to submit attendance");
    }
  };

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
    setSubmitSuccess(null);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <PageHeader
        title="My Attendance"
        description="Mark your attendance and track approval status"
      />

      <Tabs defaultValue="mark" className="w-full">
        <TabsList className="mb-6 bg-muted" data-ocid="my_attendance.tab">
          <TabsTrigger
            value="mark"
            className="gap-2"
            data-ocid="my_attendance.mark.tab"
          >
            <CalendarDays className="h-4 w-4" />
            Mark Attendance
          </TabsTrigger>
          <TabsTrigger
            value="requests"
            className="gap-2"
            data-ocid="my_attendance.requests.tab"
          >
            <Clock className="h-4 w-4" />
            My Requests
            {myCorrections.length > 0 && (
              <span className="ml-1 bg-primary text-primary-foreground text-xs rounded-full px-1.5 py-0.5 leading-none">
                {myCorrections.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ---- TAB 1: Mark Attendance ---- */}
        <TabsContent value="mark">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Calendar */}
            <div className="flex-shrink-0">
              <MiniCalendar
                selected={selectedDate}
                onSelect={handleSelectDate}
              />
            </div>

            {/* Right panel */}
            <div className="flex-1 min-w-0">
              {submitSuccess ? (
                <div
                  className="bg-green-50 border border-green-200 rounded-xl p-5 flex flex-col gap-3"
                  data-ocid="my_attendance.submit.success_state"
                >
                  <div className="flex items-center gap-2 text-green-700 font-semibold">
                    <CheckCircle2 className="h-5 w-5" />
                    Attendance Submitted
                  </div>
                  <p className="text-sm text-green-700">
                    Your attendance for{" "}
                    <span className="font-semibold">
                      {formatDateLabel(submitSuccess)}
                    </span>{" "}
                    has been submitted for School Admin approval. Once approved,
                    it will reflect in payroll.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="self-start border-green-300 text-green-700 hover:bg-green-100"
                    onClick={() => {
                      setSubmitSuccess(null);
                      setSelectedDate(null);
                    }}
                    data-ocid="my_attendance.submit.secondary_button"
                  >
                    Mark Another Date
                  </Button>
                </div>
              ) : (
                <div className="bg-white border border-border rounded-xl shadow-sm p-5 space-y-5">
                  <h2 className="font-semibold text-foreground text-base">
                    Attendance Details
                  </h2>

                  {/* Selected date display */}
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Selected Date
                    </p>
                    {selectedDate ? (
                      <p
                        className="text-sm font-semibold text-foreground"
                        data-ocid="my_attendance.selected.card"
                      >
                        {formatDateLabel(selectedDate)}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        No date selected — click a date on the calendar
                      </p>
                    )}
                  </div>

                  {/* Status badge */}
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Status
                    </p>
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700 border-green-200 text-sm px-3 py-1"
                    >
                      ✓ Present
                    </Badge>
                  </div>

                  {/* Notes */}
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Notes (Optional)
                    </p>
                    <Textarea
                      data-ocid="my_attendance.mark.textarea"
                      placeholder="Add optional notes..."
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="resize-none"
                    />
                  </div>

                  {/* Submit */}
                  <Button
                    data-ocid="my_attendance.mark.submit_button"
                    className="w-full"
                    disabled={!selectedDate || submitCorrection.isPending}
                    onClick={handleSubmit}
                  >
                    {submitCorrection.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Attendance"
                    )}
                  </Button>

                  {!selectedDate && (
                    <p className="text-xs text-muted-foreground text-center">
                      Select a date from the calendar to continue
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* ---- TAB 2: My Requests ---- */}
        <TabsContent value="requests">
          {isLoading ? (
            <div className="space-y-3">
              {["s1", "s2", "s3"].map((k) => (
                <Skeleton key={k} className="h-20 rounded-lg" />
              ))}
            </div>
          ) : myCorrections.length === 0 ? (
            <EmptyState
              title="No attendance requests yet"
              description="Use the Mark Attendance tab to submit your attendance for approval."
              ocid="my_attendance.requests.empty_state"
            />
          ) : (
            <div className="space-y-3">
              {myCorrections.map((c, i) => (
                <div
                  key={c.id}
                  data-ocid={`my_attendance.requests.item.${i + 1}`}
                  className="bg-card border border-border rounded-lg p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-sm text-foreground">
                          {bigIntToDateString(c.date)}
                        </p>
                        <Badge
                          variant="outline"
                          className={`capitalize text-xs ${
                            REQUESTED_STATUS_COLORS[c.requestedStatus] ??
                            "bg-muted text-muted-foreground"
                          }`}
                        >
                          {c.requestedStatus}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`capitalize text-xs ${
                            STATUS_COLORS[c.status.toLowerCase()] ??
                            "bg-muted text-muted-foreground"
                          }`}
                        >
                          {c.status}
                        </Badge>
                      </div>
                      {c.reason && (
                        <p className="text-sm text-muted-foreground">
                          {c.reason}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

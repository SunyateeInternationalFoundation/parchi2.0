import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { cn } from "../../lib/utils";

function Calendar({ className, classNames, showOutsideDays = true, ...props }) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-0 md:p-3 bg-white ", className)}
      classNames={{
        months: "w-full space-y-4 sm:space-x-2 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center ",
        caption_label: "text-sm font-medium  absolute top-4 right-28 ",
        nav: "space-x-1 flex items-center justify-between w-full ",
        nav_button: cn("h-7 w-7  p-0 opacity-50 hover:opacity-100"),
        nav_button_previous: "absolute left-2 ",
        nav_button_next: "absolute right-2",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "flex-1 text-gray-100 rounded-md w-9 font-normal text-[0.8rem] ",
        row: "flex w-full gap-1 mt-2",
        cell: "flex-1 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-primary [&:has([aria-selected])]:rounded-md focus-within:relative focus-within:z-20",
        // first:
        //   "[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md",
        day: "w-10 text-center h-10 rounded  p-0 font-normal aria-selected:opacity-100 aria-selected:text-white  aria-selected:bg-primary text-current hover:text-primary hover:bg-blue-500",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground w-full ",
        day_today: "bg-accent text-accent-foreground",
        day_outside: "text-gray-100 opacity-50",
        day_disabled: "text-gray-100 opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };

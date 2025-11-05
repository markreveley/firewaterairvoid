import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addWeeks, addYears } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Droplet } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Item } from '@/types';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './WaterCalendar.css';

interface WaterCalendarProps {
  items: Item[];
  fireItems?: Item[];
}

// Setup the localizer for react-big-calendar
const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// Transform items into calendar events
interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: Item;
}

export function WaterCalendar({ items, fireItems = [] }: WaterCalendarProps) {
  const navigate = useNavigate();
  const [view, setView] = useState<View>('agenda');
  const [date, setDate] = useState(new Date());

  // Transform water and fire items with deadlines into calendar events
  // For recurring items, generate instances up to 2 years in the future
  const events: CalendarEvent[] = useMemo(() => {
    // Combine water and fire items
    const allItems = [...items, ...fireItems];
    const calendarEvents: CalendarEvent[] = [];
    const maxDate = addYears(new Date(), 2); // Generate up to 2 years of recurrences

    allItems
      .filter(item => item.deadline)
      .forEach(item => {
        const deadline = item.deadline!;
        const isAllDay = deadline.getHours() === 0 && deadline.getMinutes() === 0;
        const duration = isAllDay ? 0 : 60 * 60 * 1000; // 1 hour for timed events

        // Check if item recurs
        const recurrenceType = item.recurrence_type || 'none';
        const recurrenceEndDate = item.recurrence_end_date;

        if (recurrenceType === 'none') {
          // Non-recurring event - add single instance
          calendarEvents.push({
            id: item.id,
            title: item.title,
            start: deadline,
            end: isAllDay ? deadline : new Date(deadline.getTime() + duration),
            resource: item,
          });
        } else {
          // Recurring event - generate instances
          let currentDate = new Date(deadline);
          const endDate = recurrenceEndDate
            ? new Date(Math.min(recurrenceEndDate.getTime(), maxDate.getTime()))
            : maxDate;

          let count = 0;
          const maxIterations = 200; // Safety limit

          while (currentDate <= endDate && count < maxIterations) {
            calendarEvents.push({
              id: `${item.id}-${currentDate.getTime()}`,
              title: item.title,
              start: new Date(currentDate),
              end: isAllDay ? new Date(currentDate) : new Date(currentDate.getTime() + duration),
              resource: item,
            });

            count++;

            // Generate next occurrence
            if (recurrenceType === 'weekly') {
              currentDate = addWeeks(currentDate, 1);
            } else if (recurrenceType === 'yearly') {
              currentDate = addYears(currentDate, 1);
            } else {
              break; // Safety break for unknown types
            }
          }

          // Debug logging for recurring events
          console.log(`Generated ${count} instances for recurring ${recurrenceType} event "${item.title}"`);
        }
      });

    return calendarEvents;
  }, [items, fireItems]);

  // Items without deadlines (unscheduled)
  const unscheduledItems = useMemo(() => {
    return items.filter(item => !item.deadline);
  }, [items]);

  const handleSelectEvent = (event: CalendarEvent) => {
    // Extract the actual item ID (recurring events have IDs like "abc123-1234567890")
    const itemId = event.resource.id;
    // Navigate to the item's actual type (water or fire)
    navigate(`/item/edit?id=${itemId}&type=${event.resource.type}`);
  };

  const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
    // Format the date as ISO string for URL param
    const deadlineISO = slotInfo.start.toISOString();
    navigate(`/item/new?type=water&deadline=${encodeURIComponent(deadlineISO)}`);
  };

  const handleNavigate = (newDate: Date) => {
    setDate(newDate);
  };

  const handleViewChange = (newView: View) => {
    setView(newView);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-73px)]">
      <div className={cn(
        "bg-card flex-1 flex flex-col",
        view === 'agenda' && "container mx-auto max-w-4xl"
      )}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          view={view}
          date={date}
          onNavigate={handleNavigate}
          onView={handleViewChange}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          selectable
          views={['month', 'week', 'agenda']}
          eventPropGetter={(event) => ({
            className: cn(
              event.resource.type === 'fire'
                ? 'fire-calendar-event'
                : 'water-calendar-event',
              event.resource.priority > 0 && event.resource.type === 'water' && 'water-calendar-event-priority',
              event.resource.priority > 0 && event.resource.type === 'fire' && 'fire-calendar-event-priority'
            ),
          })}
          className="water-calendar"
        />
      </div>

      {/* Unscheduled items section */}
      {unscheduledItems.length > 0 && (
        <div className={cn(
          "border-t bg-card p-4 max-h-48 overflow-y-auto",
          view === 'agenda' && "container mx-auto max-w-4xl"
        )}>
          <h3 className="text-sm font-semibold flex items-center gap-2 mb-3 sticky top-0 bg-card z-10 pb-2">
            <Droplet className="w-4 h-4 text-water-primary" />
            Unscheduled ({unscheduledItems.length})
          </h3>
          <div className="space-y-2">
            {unscheduledItems.map(item => (
              <Card
                key={item.id}
                className="p-2 border-l-4 border-l-water-primary hover:shadow-md cursor-pointer transition-all"
                onClick={() => navigate(`/item/edit?id=${item.id}&type=water`)}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium flex-1">{item.title}</p>
                </div>
                {item.notes && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                    {item.notes}
                  </p>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

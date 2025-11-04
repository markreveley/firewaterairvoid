import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addWeeks, addYears, isBefore, isAfter } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  const [view, setView] = useState<View>('month');
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
          let currentDate = deadline;
          const endDate = recurrenceEndDate
            ? (isBefore(recurrenceEndDate, maxDate) ? recurrenceEndDate : maxDate)
            : maxDate;

          while (isBefore(currentDate, endDate) || currentDate.getTime() === endDate.getTime()) {
            calendarEvents.push({
              id: `${item.id}-${currentDate.getTime()}`,
              title: item.title,
              start: currentDate,
              end: isAllDay ? currentDate : new Date(currentDate.getTime() + duration),
              resource: item,
            });

            // Generate next occurrence
            if (recurrenceType === 'weekly') {
              currentDate = addWeeks(currentDate, 1);
            } else if (recurrenceType === 'yearly') {
              currentDate = addYears(currentDate, 1);
            } else {
              break; // Safety break
            }

            // Stop if we've gone past the end date
            if (isAfter(currentDate, endDate)) {
              break;
            }
          }
        }
      });

    return calendarEvents;
  }, [items, fireItems]);

  // Items without deadlines (unscheduled)
  const unscheduledItems = useMemo(() => {
    return items.filter(item => !item.deadline);
  }, [items]);

  const handleSelectEvent = (event: CalendarEvent) => {
    // Navigate to the item's actual type (water or fire)
    navigate(`/item/edit?id=${event.id}&type=${event.resource.type}`);
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
    <div className="space-y-6">
      <div className="bg-card rounded-lg border shadow-sm p-4">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
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
        <div className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Droplet className="w-5 h-5 text-water-primary" />
            Unscheduled ({unscheduledItems.length})
          </h3>
          <div className="space-y-2">
            {unscheduledItems.map(item => (
              <Card
                key={item.id}
                className="p-3 border-l-4 border-l-water-primary hover:shadow-md cursor-pointer transition-all"
                onClick={() => navigate(`/item/edit?id=${item.id}&type=water`)}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium flex-1">{item.title}</p>
                  {item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 justify-end">
                      {item.tags.map(tag => (
                        <Badge key={tag.id} variant="outline" className="text-xs">
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  )}
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

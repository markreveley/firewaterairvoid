import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Droplet } from 'lucide-react';
import { cn } from '@/lib/utils';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './WaterCalendar.css';

interface Tag {
  id: string;
  name: string;
}

interface Item {
  id: string;
  title: string;
  type: 'fire' | 'water' | 'air' | 'void' | 'earth';
  notes?: string;
  tags: Tag[];
  deadline?: Date;
  priority: number;
  completed: boolean;
}

interface WaterCalendarProps {
  items: Item[];
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

export function WaterCalendar({ items }: WaterCalendarProps) {
  const navigate = useNavigate();
  const [view, setView] = useState<View>('month');
  const [date, setDate] = useState(new Date());

  // Transform items with deadlines into calendar events
  const events: CalendarEvent[] = useMemo(() => {
    return items
      .filter(item => item.deadline)
      .map(item => {
        const deadline = item.deadline!;
        // If no time is set (midnight), make it an all-day event
        const isAllDay = deadline.getHours() === 0 && deadline.getMinutes() === 0;

        return {
          id: item.id,
          title: item.title,
          start: deadline,
          // All-day events should end at the same day; timed events are 1 hour by default
          end: isAllDay ? deadline : new Date(deadline.getTime() + 60 * 60 * 1000),
          resource: item,
        };
      });
  }, [items]);

  // Items without deadlines (unscheduled)
  const unscheduledItems = useMemo(() => {
    return items.filter(item => !item.deadline);
  }, [items]);

  const handleSelectEvent = (event: CalendarEvent) => {
    navigate(`/item/edit?id=${event.id}&type=water`);
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
          views={['month', 'week', 'agenda']}
          eventPropGetter={(event) => ({
            className: cn(
              'water-calendar-event',
              event.resource.priority > 0 && 'water-calendar-event-priority'
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

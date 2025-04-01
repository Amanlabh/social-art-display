
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
  type: "workshop" | "performance" | "exhibition" | "other";
}

const EventsManager = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [newEvent, setNewEvent] = useState<Omit<Event, 'id'>>({
    title: '',
    date: '',
    location: '',
    description: '',
    type: 'performance'
  });
  
  useEffect(() => {
    const savedEvents = localStorage.getItem('userEvents');
    if (savedEvents) {
      setEvents(JSON.parse(savedEvents));
    }
  }, []);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewEvent(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const addEvent = () => {
    // Validate event data
    if (!newEvent.title || !newEvent.date || !newEvent.location) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    // Create new event with unique ID
    const event: Event = {
      ...newEvent,
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    
    // Add to events array
    const updatedEvents = [...events, event];
    setEvents(updatedEvents);
    
    // Save to localStorage
    localStorage.setItem('userEvents', JSON.stringify(updatedEvents));
    
    // Reset form
    setNewEvent({
      title: '',
      date: '',
      location: '',
      description: '',
      type: 'performance'
    });
    
    toast.success("Event added successfully!");
  };
  
  const removeEvent = (id: string) => {
    const updatedEvents = events.filter(event => event.id !== id);
    setEvents(updatedEvents);
    localStorage.setItem('userEvents', JSON.stringify(updatedEvents));
    toast.success("Event removed successfully!");
  };
  
  // Get upcoming events (events with dates in the future)
  const upcomingEvents = events
    .filter(event => new Date(event.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // Get past events
  const pastEvents = events
    .filter(event => new Date(event.date) < new Date())
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Most recent past events first
  
  return (
    <Card className="border shadow-sm bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Events & Workshops
        </CardTitle>
        <CardDescription>
          Add your upcoming events, performances, workshops, and exhibitions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {/* Add New Event Form */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
            <h3 className="text-base font-medium mb-3">Add New Event</h3>
            <div className="grid gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium mb-1">
                    Event Title *
                  </label>
                  <Input
                    id="title"
                    name="title"
                    value={newEvent.title}
                    onChange={handleChange}
                    placeholder="Exhibition, Concert, Workshop..."
                    required
                  />
                </div>
                <div>
                  <label htmlFor="date" className="block text-sm font-medium mb-1">
                    Date *
                  </label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    value={newEvent.date}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="location" className="block text-sm font-medium mb-1">
                    Location *
                  </label>
                  <Input
                    id="location"
                    name="location"
                    value={newEvent.location}
                    onChange={handleChange}
                    placeholder="Venue, City, Address..."
                    required
                  />
                </div>
                <div>
                  <label htmlFor="type" className="block text-sm font-medium mb-1">
                    Event Type
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={newEvent.type}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="performance">Performance</option>
                    <option value="workshop">Workshop</option>
                    <option value="exhibition">Exhibition</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-1">
                  Description
                </label>
                <Textarea
                  id="description"
                  name="description"
                  value={newEvent.description}
                  onChange={handleChange}
                  placeholder="Describe your event..."
                  rows={3}
                />
              </div>
              
              <Button onClick={addEvent} className="w-full sm:w-auto flex gap-2">
                <Plus className="h-4 w-4" />
                Add Event
              </Button>
            </div>
          </div>
          
          {/* Upcoming Events List */}
          {upcomingEvents.length > 0 && (
            <div>
              <h3 className="text-base font-medium mb-3">Upcoming Events ({upcomingEvents.length})</h3>
              <div className="space-y-3">
                {upcomingEvents.map(event => (
                  <div key={event.id} className="flex items-start gap-4 p-3 bg-white border rounded-lg">
                    <div className="bg-blue-50 text-blue-600 flex flex-col items-center justify-center p-2 rounded-md min-w-[60px] text-center">
                      <span className="text-sm font-bold">
                        {new Date(event.date).toLocaleDateString('en-US', { day: '2-digit' })}
                      </span>
                      <span className="text-xs">
                        {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{event.title}</h4>
                          <p className="text-sm text-gray-600">{event.location}</p>
                        </div>
                        <span className="text-xs font-semibold px-2 py-1 bg-gray-100 rounded-full">
                          {event.type}
                        </span>
                      </div>
                      {event.description && (
                        <p className="text-sm text-gray-500 mt-1">{event.description}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeEvent(event.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Past Events List */}
          {pastEvents.length > 0 && (
            <div>
              <h3 className="text-base font-medium mb-3">Past Events ({pastEvents.length})</h3>
              <div className="space-y-3">
                {pastEvents.map(event => (
                  <div key={event.id} className="flex items-start gap-4 p-3 bg-gray-50 border rounded-lg opacity-75">
                    <div className="bg-gray-100 text-gray-600 flex flex-col items-center justify-center p-2 rounded-md min-w-[60px] text-center">
                      <span className="text-sm font-bold">
                        {new Date(event.date).toLocaleDateString('en-US', { day: '2-digit' })}
                      </span>
                      <span className="text-xs">
                        {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{event.title}</h4>
                          <p className="text-sm text-gray-600">{event.location}</p>
                        </div>
                        <span className="text-xs font-semibold px-2 py-1 bg-gray-200 rounded-full">
                          {event.type}
                        </span>
                      </div>
                      {event.description && (
                        <p className="text-sm text-gray-500 mt-1">{event.description}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeEvent(event.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {events.length === 0 && (
            <div className="text-center py-8">
              <Calendar className="h-10 w-10 text-gray-300 mx-auto mb-2" />
              <h3 className="text-base font-medium text-gray-700">No events yet</h3>
              <p className="text-sm text-gray-500">
                Add your upcoming events, workshops, and performances to showcase them on your portfolio
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EventsManager;

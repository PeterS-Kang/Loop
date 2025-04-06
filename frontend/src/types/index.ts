// Example: types/index.ts (or define within the component)
export interface Event {
    _id: string;
    title: string;
    name: string;
    date: string;
    startTime: string | {$date: string};
    endTime?: string | {$date: string};
    start_time: {$date: string};
    end_time: {$date: string};
    location: {type: string, coordinates: [number, number]};
    description?: string;
    organizationName: string;
    // --- New fields ---
    isSavedByCurrentUser?: boolean; // Does the logged-in user have this saved?
    isAttendedByCurrentUser?: boolean; // Is the logged-in user marked as attending?
  }
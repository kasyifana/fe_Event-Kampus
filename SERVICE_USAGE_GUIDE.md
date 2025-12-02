# Event Campus - Service Usage Guide

Quick reference for using the new services in your components.

## Import Examples

```typescript
// Services
import { WhitelistService } from '../../services/whitelist.service';
import { AttendanceService } from '../../services/attendance.service';
import { RegistrationService } from '../../services/registration.service';

// Models
import { Event, CreateEventRequest } from '../../models/event.model';
import { WhitelistRequest } from '../../models/whitelist.model';
import { Attendance } from '../../models/attendance.model';

// Utilities
import { getErrorMessage } from '../../utils/error-handler.utils';
import { formatDate, formatDateTime } from '../../utils/date.utils';
import { validateImageFile, getPosterUrl } from '../../utils/file.utils';
```

## Quick Snippets

### Whitelist Request Form

```typescript
export class WhitelistRequestComponent {
  organizationName = '';
  document: File | null = null;

  constructor(private whitelistService: WhitelistService) {}

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const validation = validateDocumentFile(file);
      if (!validation.valid) {
        alert(validation.error);
        return;
      }
      this.document = file;
    }
  }

  submit() {
    if (!this.document) return;

    this.whitelistService.submitRequest({
      organization_name: this.organizationName,
      document: this.document
    }).subscribe({
      next: () => alert('Request submitted!'),
      error: (err) => alert(getErrorMessage(err))
    });
  }
}
```

### Event Registration

```typescript
export class EventDetailComponent {
  eventId: string;
  isRegistered = false;

  constructor(private registrationService: RegistrationService) {}

  registerForEvent() {
    this.registrationService.registerToEvent(this.eventId).subscribe({
      next: () => {
        this.isRegistered = true;
        alert('Registered successfully!');
      },
      error: (err) => alert(getErrorMessage(err))
    });
  }
}
```

### Attendance Marking

```typescript
export class AttendanceComponent {
  eventId: string;
  attendances: Attendance[] = [];

  constructor(private attendanceService: AttendanceService) {}

  loadAttendance() {
    this.attendanceService.getEventAttendance(this.eventId).subscribe({
      next: (response) => this.attendances = response.data,
      error: (err) => console.error(getErrorMessage(err))
    });
  }

  markAttendance(userId: string) {
    this.attendanceService.markAttendance(this.eventId, { user_id: userId })
      .subscribe({
        next: () => this.loadAttendance(),
        error: (err) => alert(getErrorMessage(err))
      });
  }

  markBulkAttendance(userIds: string[]) {
    this.attendanceService.markBulkAttendance(this.eventId, { user_ids: userIds })
      .subscribe({
        next: (response) => {
          console.log(`Marked ${response.data.success_count} attendances`);
          this.loadAttendance();
        },
        error: (err) => alert(getErrorMessage(err))
      });
  }
}
```

## Constants Usage

```typescript
import { EVENT_CATEGORIES, EVENT_STATUSES } from '../../utils/constants';

// In template
<select [(ngModel)]="category">
  <option *ngFor="let cat of eventCategories" [value]="cat.value">
    {{ cat.label }}
  </option>
</select>

// In component
eventCategories = EVENT_CATEGORIES;
eventStatuses = EVENT_STATUSES;
```

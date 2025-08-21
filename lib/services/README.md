# Dispatch App - Supabase Database Services

This directory contains service modules for interacting with the Supabase database.

## Reports Service

The reports service provides functions for managing incident reports in the Dispatch app.

### Import

```typescript
import { reportService } from '../lib/services/reports';
```

### API

#### addReport

Creates a new incident report.

```typescript
async addReport(
  subject: string, 
  body: string, 
  attachments?: string[]
): Promise<DbResponse<Report>>
```

- **Parameters**:
  - `subject`: The title/subject of the report
  - `body`: The detailed content of the report
  - `attachments` (optional): Array of attachment URLs

- **Returns**: Promise with the created report or error

- **Example**:
  ```typescript
  const { data, error } = await reportService.addReport(
    'Broken water pipe',
    'Water pipe burst in main hallway of Building C.',
    ['https://example.com/image.jpg']
  );

  if (error) {
    console.error('Failed to create report:', error.message);
  } else {
    console.log('Report created:', data);
  }
  ```

#### getMyReports

Gets all reports created by the authenticated user.

```typescript
async getMyReports(): Promise<DbResponse<Report[]>>
```

- **Returns**: Promise with array of the user's reports or error

- **Example**:
  ```typescript
  const { data, error } = await reportService.getMyReports();

  if (error) {
    console.error('Failed to load reports:', error.message);
  } else {
    console.log('Reports:', data);
  }
  ```

#### getReportById

Gets a single report by ID (if the user has access).

```typescript
async getReportById(id: number): Promise<DbResponse<Report>>
```

- **Parameters**:
  - `id`: The numeric ID of the report to retrieve

- **Returns**: Promise with the report details or error

- **Example**:
  ```typescript
  const { data, error } = await reportService.getReportById(123);

  if (error) {
    console.error('Failed to load report:', error.message);
  } else {
    console.log('Report details:', data);
  }
  ```

#### updateReport

Updates an existing report (if the user is the owner).

```typescript
async updateReport(
  id: number,
  subject?: string,
  body?: string,
  attachments?: string[]
): Promise<DbResponse<Report>>
```

- **Parameters**:
  - `id`: The numeric ID of the report to update
  - `subject` (optional): Updated subject
  - `body` (optional): Updated body content
  - `attachments` (optional): Updated attachments array

- **Returns**: Promise with the updated report or error

- **Example**:
  ```typescript
  const { data, error } = await reportService.updateReport(
    123,
    'Updated: Broken water pipe',
    'Updated description of the issue.',
    ['https://example.com/updated-image.jpg']
  );

  if (error) {
    console.error('Failed to update report:', error.message);
  } else {
    console.log('Report updated:', data);
  }
  ```

#### deleteReport

Deletes a report by ID (if the user is the owner).

```typescript
async deleteReport(id: number): Promise<DbResponse<Report>>
```

- **Parameters**:
  - `id`: The numeric ID of the report to delete

- **Returns**: Promise with success status or error

- **Example**:
  ```typescript
  const { error } = await reportService.deleteReport(123);

  if (error) {
    console.error('Failed to delete report:', error.message);
  } else {
    console.log('Report deleted successfully');
  }
  ```

## Security

All database operations are secured by Row Level Security (RLS) policies in Supabase that ensure:

1. Users can only see their own reports
2. Users can only update/delete their own reports
3. Reporter ID is automatically set to the authenticated user's ID

## Types

### Report

```typescript
export type Report = {
  id?: number;
  reporter_id: string;
  created_at?: string;
  subject?: string;
  body?: string;
  attachments?: string[];
};
```

### DbResponse

```typescript
export type DbResponse<T> = {
  data: T | null;
  error: PostgrestError | null;
};
```

## Integration Steps

To integrate the reports functionality in your component:

1. Import the service:
   ```typescript
   import { reportService } from '../lib/services/reports';
   ```

2. Use the API functions in your components (see examples folder for full component examples)

3. Handle errors and loading states in your UI

4. Make sure users are authenticated before calling these functions
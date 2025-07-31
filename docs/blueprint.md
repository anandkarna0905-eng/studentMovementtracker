# **App Name**: StudentMovementTracker

## Core Features:

- Geofence Visualization: Display a map showing the geofenced boundary of the campus.
- Real-Time Location Tracking: Monitor student location in real time during college hours (9:00 AM - 4:00 PM).
- Geofence Breach Detection: Trigger an alert if a student crosses the geofenced boundary (e.g., 100m radius from the college campus) between 9:00 AM and 4:00 PM.
- Instant Alert Notification: Send an alert via Firebase Cloud Messaging (FCM) to the assigned faculty or head of department with the student’s name, ID, location coordinates, and time of breach.
- Location Status Reasoning: Determine student's status: in breach or not in breach. Then, leverage the status as a tool when preparing notifications to the user.

## Style Guidelines:

- Primary color: A calm, authoritative blue (#4F86C6) reminiscent of institutional trust and reliability.
- Background color: A light, desaturated blue (#E0E8F3) to provide a clean, unobtrusive backdrop.
- Accent color: A contrasting orange (#D97706) to draw attention to alerts and important notifications.
- Headline Font: 'Space Grotesk' (sans-serif) for a tech-forward, modern feel to the UI
- Body Font: 'Inter' (sans-serif) for comfortable readability in the app's displays.
- Use simple, clear icons to represent student status, location, and notifications.
- Employ a clean, card-based layout to display student information and alerts efficiently.
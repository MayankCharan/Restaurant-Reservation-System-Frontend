# Restaurant Reservation System - Frontend

A responsive React application for customers and administrators to manage restaurant reservations.

---

## Tech Stack

- React
- React Router
- Axios
- Tailwind CSS / CSS
- Context API / State Management
- JWT Authentication

---

## Features

### User

- Register & Login
- Browse available reservation slots
- Create reservation
- View reservation history
- Cancel reservation

### Admin

- Dashboard
- View all reservations
- Manage reservation status
- Manage restaurant availability

---

# Setup Instructions

## Prerequisites

- Node.js (v18 or later)
- npm or yarn

## Installation

```bash
git clone <repository-url>
cd client

npm install
```

Create a `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
```

Run the development server:

```bash
npm run dev
```

Application runs on:

```
http://localhost:5173
```

Build production version:

```bash
npm run build
```

---

# Assumptions Made

- Backend API is running before starting the frontend.
- Authentication uses JWT.
- Every reservation belongs to one authenticated user.
- Time slots are fetched dynamically from the backend.
- Frontend trusts backend validation for reservation conflicts.

---

# Reservation & Availability Logic

The frontend does not calculate availability on its own.

Workflow:

1. User selects date and time.
2. Frontend requests available slots from the backend.
3. Only available slots are displayed.
4. User submits reservation.
5. Backend validates:
   - Slot exists
   - Capacity is available
   - No booking conflicts
6. UI updates after successful reservation.

This prevents users from booking unavailable slots.

---

# Role-Based Access

## User

Accessible pages:

- Home
- Reservation
- My Reservations
- Profile

Users can:

- Create reservations
- View their reservations
- Cancel their own reservations

---

## Admin

Admins can access:

- Admin Dashboard
- Reservation Management
- Availability Management

Admins can:

- View all reservations
- Update reservation status
- Manage restaurant availability

Protected routes ensure only administrators can access admin pages.

---

# Known Limitations

- No real-time reservation updates.
- No push/email notifications.
- No payment integration.
- Limited client-side caching.
- No offline support.

---

# Areas for Improvement

With additional development time:

- Real-time slot updates using WebSockets
- Calendar-based booking UI
- Better loading skeletons
- Reservation reminders
- Pagination for large datasets
- Advanced filtering
- Multi-language support
- Unit and integration tests
- Dark mode
- Accessibility improvements

---

# Folder Structure

```
client/
│
├── src/
├── public/
├── components/
├── pages/
├── services/
├── hooks/
├── context/
└── assets/
```

---

# Environment Variables

```
VITE_API_URL=
```

---

# License

For assessment purposes only.

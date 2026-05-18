# College Event Management System

A full-stack web application for managing college events with user authentication, event registration, and admin management features.

## Features

### For Students:
- User registration and login
- Browse published events
- View event details
- Register for events
- View registered events

### For Admins:
- Login with admin credentials
- Create, edit, and delete events
- Manage event status (Draft, Published, Completed)
- View event registrations

## Tech Stack

### Backend:
- Spring Boot 3.5.5
- Spring Security with JWT
- Spring Data JPA
- MySQL Database
- Maven

### Frontend:
- React 19.1.1
- React Router DOM
- Axios for API calls
- CSS with black and white theme

## Setup Instructions

### Prerequisites:
- Java 17 or higher
- Node.js 16 or higher
- Maven
- MySQL 8.0 or higher

### Backend Setup:

1. Navigate to the backend directory:
   ```bash
   cd collegebackend
   ```

2. Install dependencies and run:
   ```bash
   mvn clean install
   mvn spring-boot:run
   ```

3. The backend will start on `http://localhost:8080`

4. Make sure MySQL is running and create the database:
   ```sql
   CREATE DATABASE college_event_db;
   ```

### Frontend Setup:

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. The frontend will start on `http://localhost:3000`

## Default Credentials

### Admin Account:
- Email: `admin@college.edu`
- Password: `admin123`

### Student Account:
- Register a new account through the registration page

## API Endpoints

### Authentication:
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Student registration

### Events:
- `GET /api/events` - Get all published events
- `GET /api/events/{id}` - Get event details
- `POST /api/events` - Create event (Admin only)
- `PUT /api/events/{id}` - Update event (Admin only)
- `DELETE /api/events/{id}` - Delete event (Admin only)
- `POST /api/events/{id}/register` - Register for event (Student only)

### Users:
- `GET /api/users/{id}/events` - Get user's registered events

## Database Schema

### Users Table:
- id, student_id, name, email, password_hash, role

### Events Table:
- id, title, description, event_date, start_time, end_time, location, max_capacity, registered_count, status

### Registrations Table:
- id, student_id, event_id, registration_date, attended

## Features Implemented

✅ User Authentication (Login/Register)
✅ Role-based Access Control (Admin/Student)
✅ Event Management (CRUD operations)
✅ Event Registration
✅ Responsive Design
✅ Black and White Theme
✅ JWT Token Authentication
✅ Input Validation
✅ Error Handling

## Usage

1. Start both backend and frontend servers
2. Visit `http://localhost:3000`
3. Register as a student or login as admin
4. Browse events, register for events, or manage events (admin)

## Notes

- The application uses MySQL database for persistent data storage
- The admin user is automatically created on application startup
- All API communications are secured with JWT tokens
- The UI follows a clean black and white design theme
- Make sure MySQL service is running before starting the backend
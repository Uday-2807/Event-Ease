# EventEase – Event Registration System

## 1. Project Overview

EventEase is a full-stack event registration web application built using the MERN stack. It allows participants to browse available events and register online, while providing an admin panel to create events, manage event listings, and view participant registrations.

The application uses React for the frontend, Node.js and Express.js for the backend, and MongoDB for storing event and registration data.

## 2. Features

### Participant Features
- Browse available events and view event details.
- Register for an event by submitting the required information.
- Prevent duplicate registrations for the same event using the same email address.
- Enforce event capacity limits to prevent overbooking.
- View event registration counts and available capacity.
- Access the application through a user-friendly interface.
- Switch between light and dark themes.

### Admin Features
- Secure admin login using a single configured admin password.
- Create and publish events.
- View participants registered for each event.
- Monitor registration counts and event capacity.
- Delete events only when they have no registrations.

**Authorized Admin Password: UK07@9845123**

### General Features
- Responsive user interface.
- Frontend and backend separation.
- REST API-based communication.
- MongoDB database integration.
- JWT-based authentication for admin functionality.
- Deployment using Render.

## 3. Technology Stack

- **Frontend:** React, Vite, JavaScript, CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas
- **Authentication:** JSON Web Tokens (JWT)
- **Deployment:** Render
- **Version Control:** Git and GitHub

## 4. How to Use the Application

### Participant Instructions

Participants can use EventEase without an admin account or admin password.

1. Open the deployed EventEase website.
2. Browse the available events.
3. Select the event you want to attend.
4. Enter the required registration details.
5. Submit the registration form.
6. Check the message displayed by the application to confirm the registration status.

Participants cannot register beyond an event's capacity or register multiple times for the same event using the same email address.

### Admin Instructions

EventEase uses a single admin password rather than separate accounts for multiple administrators.

1. Open the deployed EventEase website.
2. Navigate to the Admin Login section.
3. Enter the authorized admin password.
4. After successful login, access the admin dashboard.
5. Create and manage events.
6. View participant details and registration counts for each event.
7. Delete events that have no registrations.

Admin access is intended only for authorized users. The admin password and other sensitive credentials are not included in this repository.

## 5. Running the Project Locally

### Prerequisites

- Node.js and npm
- Git
- Access to a configured MongoDB database

### Step 1: Clone the Repository

```bash
git clone https://github.com/Uday-2807/Event-Ease.git
cd EventEase
```

### Step 2: Install Backend Dependencies

```bash
cd server
npm install
```

The backend requires its environment configuration to be set up separately by an authorized project maintainer. Sensitive credentials should never be added to the public repository.

### Step 3: Start the Backend

From the `server` directory, run:

```bash
node server.js
```

The backend will start on the port configured by the application.

### Step 4: Install Frontend Dependencies

Open a second terminal and navigate to the project’s `client` directory:

```bash
cd client
npm install
```

### Step 5: Configure and Start the Frontend

Configure the frontend to use the appropriate backend API URL for your environment.

For local development, the API URL is typically:

```text
http://localhost:5000
```

Start the frontend development server:

```bash
npm run dev
```

Open the local URL shown in the terminal, typically `http://localhost:5173`.

**Note:** Local execution requires a properly configured backend and database connection. Deployment configuration and sensitive credentials are managed separately.

## 6. Deployment

EventEase is deployed on Render using separate frontend and backend services.

- **Live Website:** [Insert your deployed frontend URL]
- **Backend API:** [Insert your deployed backend URL, if you want to share it]

The frontend communicates with the backend through the configured API URL. The backend connects to the database and handles event management, registrations, and admin authentication.

## 7. Project Structure

```text
EventEase/
├── client/
│   ├── src/
│   ├── public/
│   └── package.json
├── server/
│   ├── server.js
│   └── package.json
└── README.md
```

The `client` directory contains the React frontend, while the `server` directory contains the Express backend and API logic.

## 8. Security

- Admin access is protected by a configured password.
- Sensitive credentials are kept out of the public repository.
- Environment files containing secrets should not be committed to GitHub.
- Database access and authentication secrets should be managed through private environment configuration.

## 9. Future Enhancements

Possible future improvements include:
- Email registration confirmations.
- Participant registration history.
- Event search and filtering.
- Event attendance tracking.
- Enhanced reporting and analytics.

## 10. Conclusion

EventEase provides a simple way to manage event registrations through a web-based platform. Participants can discover events and register online, while the administrator can manage events and monitor registrations through a dedicated admin panel.
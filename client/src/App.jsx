import { useEffect, useRef, useState } from "react";
import "./App.css";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function App() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("eventease-theme") || "light",
  );
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const registrationSectionRef = useRef(null);
  const attendeeSectionRef = useRef(null);
  const [participantName, setParticipantName] = useState("");
  const [participantEmail, setParticipantEmail] = useState("");
  const [registrationMessage, setRegistrationMessage] = useState("");
  const [registrationError, setRegistrationError] = useState("");
  const [registering, setRegistering] = useState(false);
  const [adminEmail, setAdminEmail] = useState("admin@eventease.local");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminToken, setAdminToken] = useState("");
  const [adminMessage, setAdminMessage] = useState("");
  const [adminEvents, setAdminEvents] = useState([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventDescription, setNewEventDescription] = useState("");
  const [newEventDateTime, setNewEventDateTime] = useState("");
  const [newEventLocation, setNewEventLocation] = useState("");
  const [newEventCapacity, setNewEventCapacity] = useState("20");
  const [adminError, setAdminError] = useState("");
  const [selectedAttendees, setSelectedAttendees] = useState(null);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("eventease-theme", theme);
  }, [theme]);
  useEffect(() => {
    if (selectedEvent && registrationSectionRef.current) {
      registrationSectionRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [selectedEvent]);
  useEffect(() => {
    if (selectedAttendees && attendeeSectionRef.current) {
      attendeeSectionRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [selectedAttendees]);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const response = await fetch(`${API_URL}/api/events`);

        if (!response.ok) {
          throw new Error("Unable to load events.");
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("The events API returned an unexpected response.");
        }

        setEvents(data);
      } catch (err) {
        console.error("Event loading error:", err);
        setError(
          "We could not load events. Please check that the backend is running.",
        );
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  function toggleTheme() {
    setTheme((currentTheme) => (currentTheme === "light" ? "dark" : "light"));
  }

  function formatDate(dateTime) {
    const date = new Date(dateTime);

    if (Number.isNaN(date.getTime())) {
      return "Date to be announced";
    }

    return date.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  async function handleAdminLogin(event) {
    event.preventDefault();
    setAdminMessage("");

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: adminEmail.trim(),
          password: adminPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "Admin login failed.");
      }

      setAdminToken(data.token);
      setAdminPassword("");
      setAdminMessage("Login successful!");
      await loadAdminEvents(data.token);
    } catch (err) {
      setAdminToken("");
      setAdminMessage(err.message || "Unable to log in. Please try again.");
    }
  }

  async function loadAdminEvents(token) {
    setAdminLoading(true);
    setAdminError("");

    try {
      const response = await fetch(`${API_URL}/api/events`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "Could not load events.");
      }

      if (!Array.isArray(data)) {
        throw new Error("Unexpected response from the events API.");
      }

      setAdminEvents(data);
    } catch (err) {
      setAdminError(err.message || "Could not load events.");
    } finally {
      setAdminLoading(false);
    }
  }

  async function loadAttendees(eventId) {
    setAdminError("");
    setSelectedAttendees(null);

    try {
      const response = await fetch(
        `${API_URL}/api/events/${eventId}/attendees`,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || data.error || "Could not load attendees.",
        );
      }

      setSelectedAttendees(data);

    } catch (err) {
      setAdminError(err.message || "Could not load attendees.");
    }
  }
  async function handleDeleteEvent(eventId) {
    const confirmed = window.confirm(
      "Delete this event? Only events with zero registrations can be deleted.",
    );

    if (!confirmed) return;

    setAdminError("");
    setAdminMessage("");

    try {
      const response = await fetch(`${API_URL}/api/events/${eventId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete event.");
      }

      setAdminMessage("Event deleted successfully.");
      setSelectedAttendees(null);

      await loadAdminEvents(adminToken);
      await refreshPublicEvents();
    } catch (error) {
      setAdminError(error.message || "Failed to delete event.");
    }
  }

  async function handleCreateEvent(event) {
    event.preventDefault();
    setAdminError("");
    setAdminMessage("");

    try {
      const response = await fetch(`${API_URL}/api/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          title: newEventTitle.trim(),
          description: newEventDescription.trim(),
          dateTime: newEventDateTime,
          location: newEventLocation.trim(),
          capacity: Number(newEventCapacity),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || data.error || "Could not create event.",
        );
      }

      setAdminMessage("Event created successfully!");
      setNewEventTitle("");
      setNewEventDescription("");
      setNewEventDateTime("");
      setNewEventLocation("");
      setNewEventCapacity("20");

      await loadAdminEvents(adminToken);
      await refreshPublicEvents();
    } catch (err) {
      setAdminError(err.message || "Could not create event.");
    }
  }

  async function refreshPublicEvents() {
    try {
      const response = await fetch(`${API_URL}/api/events`);

      if (!response.ok) {
        throw new Error("Unable to refresh the public event list.");
      }

      const data = await response.json();

      if (Array.isArray(data)) {
        setEvents(data);
      }
    } catch (err) {
      console.error("Event refresh error:", err);
    }
  }

  async function handleRegistration(event) {
    event.preventDefault();

    if (!selectedEvent || registering) return;

    setRegistering(true);
    setRegistrationMessage("");
    setRegistrationError("");

    try {
      const response = await fetch(
        `${API_URL}/api/events/${selectedEvent._id}/registrations`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            participantName: participantName.trim(),
            email: participantEmail.trim(),
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Registration failed. Please try again.",
        );
      }

      setRegistrationMessage(`You're registered for ${selectedEvent.title}!`);

      setEvents((currentEvents) =>
        currentEvents.map((item) =>
          item._id === selectedEvent._id
            ? {
                ...item,
                registeredCount: Number(item.registeredCount || 0) + 1,
              }
            : item,
        ),
      );

      setParticipantName("");
      setParticipantEmail("");
    } catch (err) {
      setRegistrationError(
        err.message || "Something went wrong. Please try again.",
      );
    } finally {
      setRegistering(false);
    }
  }

  return (
    <div className="app">
      <header className="navbar">
        <a className="brand" href="#home" aria-label="EventEase home">
          <span className="brand-icon">E</span>
          <span>EventEase</span>
        </a>

        <nav className="nav-links" aria-label="Main navigation">
          <a href="#events">Explore events</a>
          <a href="#about">About</a>
        </nav>

        <div className="nav-actions">
          <button
            className="theme-toggle"
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
            title={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
          >
            {theme === "light" ? "☾" : "☀"}
          </button>
          <a className="admin-link" href="#admin">
            Admin login
          </a>
        </div>
      </header>

      <main id="home">
        <section className="hero">
          <span className="eyebrow">DISCOVER · CONNECT · EXPERIENCE</span>
          <h1>
            Make time for
            <br />
            <span>something meaningful.</span>
          </h1>
          <p>
            Discover workshops, meet new people, and reserve your spot at
            experiences worth showing up for.
          </p>
          <a className="primary-button" href="#events">
            Explore events <span aria-hidden="true">→</span>
          </a>
          <div className="hero-note">
            <span className="note-dot" />
            Find your next experience with EventEase
          </div>
        </section>

        <section className="events-section" id="events">
          <div className="section-heading">
            <div>
              <span className="eyebrow">WHAT'S HAPPENING</span>
              <h2>Explore upcoming events</h2>
              <p>Find something you’ll look forward to.</p>
            </div>
          </div>

          {loading ? (
            <div className="empty-state" role="status">
              <p>Loading upcoming events...</p>
            </div>
          ) : error ? (
            <div className="empty-state error-state" role="alert">
              <h3>We couldn't load the events</h3>
              <p>{error}</p>
            </div>
          ) : events.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon" aria-hidden="true">
                ▦
              </div>
              <h3>No upcoming events yet</h3>
              <p>Please check back soon for new workshops and experiences.</p>
            </div>
          ) : (
            <div className="event-grid">
              {events.map((event) => {
                const capacity = Number(event.capacity) || 0;
                const registeredCount = Number(event.registeredCount) || 0;
                const spotsLeft = Math.max(0, capacity - registeredCount);
                const isFull = spotsLeft === 0;

                return (
                  <article className="event-card" key={event._id}>
                    <div className="event-card-top">
                      <span className="event-label">EVENT</span>
                      <span
                        className={`event-capacity ${isFull ? "full" : ""}`}
                      >
                        {isFull ? "Fully booked" : `${spotsLeft} spots left`}
                      </span>
                    </div>

                    <h3>{event.title}</h3>
                    <p className="event-description">{event.description}</p>

                    <div className="event-details">
                      <p>
                        <strong>Date:</strong> {formatDate(event.dateTime)}
                      </p>
                      <p>
                        <strong>Location:</strong> {event.location}
                      </p>
                    </div>

                    <button
                      className="primary-button event-button"
                      type="button"
                      disabled={isFull}
                      onClick={() => {
                        setSelectedEvent(event);
                        setParticipantName("");
                        setParticipantEmail("");
                        setRegistrationMessage("");
                        setRegistrationError("");
                      }}
                    >
                      {isFull ? "Event full" : "View event & register"}
                    </button>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {selectedEvent && (
          <section
            className="registration-section"
            id="registration"
            ref={registrationSectionRef}
          >
            <div className="registration-panel">
              <button
                type="button"
                className="close-registration"
                onClick={() => {
                  setSelectedEvent(null);
                  setRegistrationMessage("");
                  setRegistrationError("");
                }}
              >
                ← Back to events
              </button>

              <h2>Register for {selectedEvent.title}</h2>
              <p>{selectedEvent.description}</p>

              <p>
                <strong>Date:</strong> {formatDate(selectedEvent.dateTime)}
              </p>
              <p>
                <strong>Location:</strong> {selectedEvent.location}
              </p>

              {registrationMessage && (
                <p className="registration-success" role="status">
                  {registrationMessage}
                </p>
              )}

              {registrationError && (
                <p className="registration-error" role="alert">
                  {registrationError}
                </p>
              )}

              <form onSubmit={handleRegistration}>
                <label htmlFor="participant-name">Full name</label>
                <input
                  id="participant-name"
                  type="text"
                  value={participantName}
                  onChange={(e) => setParticipantName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                  maxLength={100}
                />

                <label htmlFor="participant-email">Email address</label>
                <input
                  id="participant-email"
                  type="email"
                  value={participantEmail}
                  onChange={(e) => setParticipantEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  maxLength={254}
                />

                <button
                  className="primary-button"
                  type="submit"
                  disabled={registering}
                >
                  {registering ? "Registering..." : "Confirm registration"}
                </button>
              </form>
            </div>
          </section>
        )}

        <section className="registration-section" id="admin">
          <div className="registration-panel">
            <span className="eyebrow">ADMINISTRATION</span>
            <h2>Admin login</h2>
            <p>Sign in to manage events and view attendees.</p>

            {adminToken ? (
              <div>
                <p className="registration-success" role="status">
                  Login successful! You are signed in as an administrator.
                </p>

                <h3>Create a new event</h3>

                <form onSubmit={handleCreateEvent}>
                  <label htmlFor="new-event-title">Event title</label>
                  <input
                    id="new-event-title"
                    type="text"
                    value={newEventTitle}
                    onChange={(e) => setNewEventTitle(e.target.value)}
                    placeholder="e.g. Creative Design Workshop"
                    maxLength={150}
                    required
                  />

                  <label htmlFor="new-event-description">Description</label>
                  <textarea
                    id="new-event-description"
                    value={newEventDescription}
                    onChange={(e) => setNewEventDescription(e.target.value)}
                    placeholder="Describe the event"
                    rows={3}
                    required
                  />

                  <label htmlFor="new-event-date">Date and time</label>
                  <input
                    id="new-event-date"
                    type="datetime-local"
                    value={newEventDateTime}
                    onChange={(e) => setNewEventDateTime(e.target.value)}
                    required
                  />

                  <label htmlFor="new-event-location">Location</label>
                  <input
                    id="new-event-location"
                    type="text"
                    value={newEventLocation}
                    onChange={(e) => setNewEventLocation(e.target.value)}
                    placeholder="e.g. Bengaluru"
                    required
                  />

                  <label htmlFor="new-event-capacity">Capacity</label>
                  <input
                    id="new-event-capacity"
                    type="number"
                    value={newEventCapacity}
                    onChange={(e) => setNewEventCapacity(e.target.value)}
                    min="1"
                    required
                  />

                  <button className="primary-button" type="submit">
                    Create event
                  </button>
                </form>

                {adminMessage && (
                  <p className="registration-success" role="status">
                    {adminMessage}
                  </p>
                )}

                {adminError && (
                  <p className="registration-error" role="alert">
                    {adminError}
                  </p>
                )}

                <h3>Your events</h3>

                {adminLoading ? (
                  <p>Loading your events...</p>
                ) : adminEvents.length === 0 ? (
                  <p>No events found yet.</p>
                ) : (
                  <div className="admin-event-list">
                    {adminEvents.map((event) => (
                      <article key={event._id} className="event-card">
                        <h3>{event.title}</h3>
                        <p>{formatDate(event.dateTime)}</p>
                        <p>{event.location}</p>

                        <p>
                          Registrations: {event.registeredCount || 0} /{" "}
                          {event.capacity}
                        </p>

                        <button
                          className="primary-button"
                          type="button"
                          onClick={() => loadAttendees(event._id)}
                        >
                          View attendees
                        </button>

                        <button
                          className="delete-button"
                          type="button"
                          onClick={() => handleDeleteEvent(event._id)}
                        >
                          Delete event
                        </button>
                      </article>
                    ))}
                  </div>
                )}
                {selectedAttendees && (
                  <div className="attendee-panel">
                    <h3>
                      Attendees —{" "}
                      {selectedAttendees.event?.title ||
                        selectedAttendees.title}
                    </h3>

                    <p>
                      Registered:{" "}
                      {selectedAttendees.attendeeCount ??
                        selectedAttendees.attendees?.length ??
                        0}{" "}
                      / {selectedAttendees.capacity}
                    </p>

                    {!selectedAttendees.attendees?.length ? (
                      <p>No attendees have registered for this event yet.</p>
                    ) : (
                      <div
                        className="attendee-table-wrapper"
                        ref={attendeeSectionRef}
                      >
                        <table className="attendee-table">
                          <thead>
                            <tr>
                              <th>Name</th>
                              <th>Email</th>
                              <th>Registration date</th>
                            </tr>
                          </thead>

                          <tbody>
                            {selectedAttendees.attendees.map(
                              (attendee, index) => (
                                <tr
                                  key={
                                    attendee._id || `${attendee.email}-${index}`
                                  }
                                >
                                  <td>
                                    {attendee.name || attendee.participantName}
                                  </td>
                                  <td>{attendee.email}</td>
                                  <td>
                                    {attendee.registeredAt
                                      ? formatDate(attendee.registeredAt)
                                      : "Not available"}
                                  </td>
                                </tr>
                              ),
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleAdminLogin}>
                <label htmlFor="admin-email">Admin email</label>
                <input
                  id="admin-email"
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  autoComplete="username"
                  required
                />

                <label htmlFor="admin-password">Password</label>
                <input
                  id="admin-password"
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />

                <button className="primary-button" type="submit">
                  Sign in
                </button>

                {adminMessage && (
                  <p className="registration-error" role="alert">
                    {adminMessage}
                  </p>
                )}
              </form>
            )}

            {adminToken && (
              <button
                className="close-registration"
                type="button"
                onClick={() => {
                  setAdminToken("");
                  setAdminMessage("");
                }}
              >
                Sign out
              </button>
            )}
          </div>
        </section>

        <section className="about-section" id="about">
          <span className="eyebrow">ABOUT EVENTEASE</span>
          <h2>Good experiences start with a simple plan.</h2>
          <p>
            Discover events and reserve your spot in a few straightforward
            steps.
          </p>
        </section>
      </main>

      <footer className="footer">
        <a className="brand" href="#home">
          <span className="brand-icon">E</span>
          <span>EventEase</span>
        </a>
        <p>Discover something meaningful.</p>
      </footer>
    </div>
  );
}

export default App;

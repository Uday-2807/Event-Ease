const express = require("express");
const Event = require("../models/Event");
const adminAuth = require("../middleware/adminAuth");

const router = express.Router();

// GET /api/events — list all events
router.get("/", async (req, res) => {
  try {
    const events = await Event.find().sort({ dateTime: 1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch events." });
  }
});

// POST /api/events — create an event
router.post("/",adminAuth, async (req, res) => {
  try {
    const { title, description, dateTime, location, capacity } = req.body;

    if (
      !title?.trim() ||
      !description?.trim() ||
      !dateTime ||
      !location?.trim() ||
      !Number.isInteger(capacity) ||
      capacity < 1
    ) {
      return res.status(400).json({
        message: "Provide a title, description, date/time, location, and positive integer capacity.",
      });
    }

    const event = await Event.create({
      title,
      description,
      dateTime,
      location,
      capacity,
    });

    res.status(201).json(event);
  } catch (error) {
    res.status(400).json({ message: "Failed to create event." });
  }
});



// DELETE an event only if it has no registrations
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        message: "Event not found.",
      });
    }

    if (event.registeredCount > 0) {
      return res.status(409).json({
        message:
          "This event cannot be deleted because it has registrations.",
      });
    }

    const Registration = require("../models/Registration");

    const registrationExists = await Registration.exists({
      eventId: event._id,
    });

    if (registrationExists) {
      return res.status(409).json({
        message:
          "This event cannot be deleted because it has registrations.",
      });
    }

    await Event.findByIdAndDelete(event._id);

    return res.json({
      message: "Event deleted successfully.",
    });
  } catch (error) {
    console.error("Delete event error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid event ID.",
      });
    }

    return res.status(500).json({
      message: "Failed to delete event.",
    });
  }
});

module.exports = router;
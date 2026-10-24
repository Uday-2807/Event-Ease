const express = require("express");
const mongoose = require("mongoose");
const Event = require("../models/Event");
const Registration = require("../models/Registration");
const adminAuth = require("../middleware/adminAuth");

const router = express.Router();

// POST /api/events/:id/registrations
router.post("/:id/registrations", async (req, res) => {
  try {
    const { id } = req.params;
    const { participantName, email } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid event ID." });
    }

    if (
      typeof participantName !== "string" ||
      !participantName.trim() ||
      typeof email !== "string" ||
      !email.trim()
    ) {
      return res.status(400).json({
        message: "Participant name and email are required.",
      });
    }

    const emailNormalized = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNormalized)) {
      return res.status(400).json({ message: "Enter a valid email address." });
    }

    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({ message: "Event not found." });
    }

    const existing = await Registration.findOne({
      eventId: id,
      emailNormalized,
    });

    if (existing) {
      return res.status(409).json({
        message: "This email is already registered for this event.",
      });
    }

    // Atomically claim one available seat.
    const updatedEvent = await Event.findOneAndUpdate(
      { _id: id, $expr: { $lt: ["$registeredCount", "$capacity"] } },
      { $inc: { registeredCount: 1 } },
      { new: true }
    );

    if (!updatedEvent) {
      return res.status(409).json({ message: "This event is full." });
    }

    try {
      const registration = await Registration.create({
        eventId: id,
        participantName: participantName.trim(),
        emailNormalized,
      });

      return res.status(201).json({
        message: "Registration successful!",
        registration,
      });
    } catch (error) {
      // Release the claimed seat if registration creation fails.
      await Event.updateOne(
        { _id: id },
        { $inc: { registeredCount: -1 } }
      );

      if (error.code === 11000) {
        return res.status(409).json({
          message: "This email is already registered for this event.",
        });
      }

      throw error;
    }
  } catch (error) {
    console.error("Registration error:", error.message);
    return res.status(500).json({
      message: "Registration failed. Please try again.",
    });
  }
});



// GET /api/events/:id/attendees
// Admin-only attendee list for one event.
 
router.get("/:id/attendees", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid event ID." });
    }

    const event = await Event.findById(id).select(
      "title capacity registeredCount"
    );

    if (!event) {
      return res.status(404).json({ message: "Event not found." });
    }

    const attendees = await Registration.find({ eventId: id })
      .select("participantName emailNormalized registeredAt")
      .sort({ registeredAt: 1 })
      .lean();

    return res.json({
      event: {
        id: event._id,
        title: event.title,
        capacity: event.capacity,
        registeredCount: event.registeredCount,
        attendeeCount: attendees.length,
      },
      attendees: attendees.map((attendee) => ({
        name: attendee.participantName,
        email: attendee.emailNormalized,
        registeredAt: attendee.registeredAt,
      })),
    });
  } catch (error) {
    console.error("Attendee list error:", error.message);
    return res.status(500).json({
      message: "Failed to fetch attendees.",
    });
  }
});

module.exports = router;

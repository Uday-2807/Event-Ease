// Creating Schema for Event Registrations

const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    participantName: {
      type: String,
      required: true,
      trim: true,
    },
    emailNormalized: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    registeredAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// The same email cannot register for the same event twice 
registrationSchema.index(
  { eventId: 1, emailNormalized: 1 },
  { unique: true }
);

module.exports = mongoose.model("Registration", registrationSchema);

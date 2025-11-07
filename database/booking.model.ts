import mongoose, { Document, ObjectId, Schema } from 'mongoose';
import Event from './event.model';

/**
 * TypeScript interface for Booking document
 */
export interface IBooking extends Document {
  eventId: ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Validates email format using RFC 5322 simplified regex
 */
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const bookingSchema = new Schema<IBooking>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event ID is required'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      validate: {
        validator: isValidEmail,
        message: 'Please provide a valid email address',
      },
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Create index on eventId for faster queries filtering by event
 */
bookingSchema.index({ eventId: 1 });

/**
 * Pre-save hook: verify that referenced event exists in database
 */
bookingSchema.pre<IBooking>('save', async function (next) {
  try {
    // Only validate eventId if it's new or modified
    if (this.isModified('eventId')) {
      const event = await Event.findById(this.eventId);
      if (!event) {
        throw new Error(
          `Event with ID ${this.eventId} does not exist`
        );
      }
    }

    next();
  } catch (error) {
    next(error as Error);
  }
});

/**
 * Create or retrieve Booking model
 */
const Booking =
  mongoose.models.Booking ||
  mongoose.model<IBooking>('Booking', bookingSchema);

export default Booking;

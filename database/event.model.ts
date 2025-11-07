import mongoose, { Document, Schema } from 'mongoose';

/**
 * TypeScript interface for Event document
 */
export interface IEvent extends Document {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: 'online' | 'offline' | 'hybrid';
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Converts a string to URL-friendly slug (lowercase, replace spaces with hyphens, remove special chars)
 */
const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

/**
 * Normalizes date to ISO format (YYYY-MM-DD)
 */
const normalizeDate = (date: string): string => {
  const parsed = new Date(date);
  if (isNaN(parsed.getTime())) {
    throw new Error(`Invalid date format: ${date}`);
  }
  return parsed.toISOString().split('T')[0];
};

/**
 * Normalizes time to HH:MM format
 */
const normalizeTime = (time: string): string => {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(time)) {
    throw new Error(`Invalid time format. Expected HH:MM, got: ${time}`);
  }
  return time;
};

const eventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      sparse: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
    },
    overview: {
      type: String,
      required: [true, 'Overview is required'],
      trim: true,
    },
    image: {
      type: String,
      required: [true, 'Image URL is required'],
    },
    venue: {
      type: String,
      required: [true, 'Venue is required'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    date: {
      type: String,
      required: [true, 'Date is required'],
    },
    time: {
      type: String,
      required: [true, 'Time is required'],
    },
    mode: {
      type: String,
      enum: {
        values: ['online', 'offline', 'hybrid'],
        message: 'Mode must be one of: online, offline, hybrid',
      },
      required: [true, 'Mode is required'],
    },
    audience: {
      type: String,
      required: [true, 'Audience is required'],
      trim: true,
    },
    agenda: {
      type: [String],
      required: [true, 'Agenda is required'],
      validate: {
        validator: (v: string[]) => Array.isArray(v) && v.length > 0,
        message: 'Agenda must be a non-empty array',
      },
    },
    organizer: {
      type: String,
      required: [true, 'Organizer is required'],
      trim: true,
    },
    tags: {
      type: [String],
      required: [true, 'Tags are required'],
      validate: {
        validator: (v: string[]) => Array.isArray(v) && v.length > 0,
        message: 'Tags must be a non-empty array',
      },
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Pre-save hook: generate slug from title, normalize date/time, and validate required fields
 */
eventSchema.pre<IEvent>('save', async function (next) {
  try {
    // Generate slug only if title is new or has changed
    if (this.isModified('title') || !this.slug) {
      this.slug = generateSlug(this.title);
    }

    // Normalize and validate date format
    if (this.isModified('date')) {
      this.date = normalizeDate(this.date);
    }

    // Normalize and validate time format
    if (this.isModified('time')) {
      this.time = normalizeTime(this.time);
    }

    // Ensure all required text fields are non-empty
    const requiredFields = [
      'title',
      'description',
      'overview',
      'image',
      'venue',
      'location',
      'date',
      'time',
      'audience',
      'organizer',
    ];

    for (const field of requiredFields) {
      const value = this[field as keyof IEvent];
      if (typeof value === 'string' && value.trim() === '') {
        throw new Error(`${field} cannot be empty`);
      }
    }

    next();
  } catch (error) {
    next(error as Error);
  }
});

/**
 * Create or retrieve Event model
 */
const Event =
  mongoose.models.Event ||
  mongoose.model<IEvent>('Event', eventSchema);

export default Event;

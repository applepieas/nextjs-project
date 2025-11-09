import Event from "@/database/event.model";
import { connectToDatabase } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const formData = await req.formData();

    const event = Object.fromEntries(formData.entries()) as Record<string, string>;

    const file = formData.get('image') as File;

    if (!file) { return NextResponse.json('Image file is required', { status: 400 }); }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream({ resource_type: 'image', folder: 'DevEvent' }, (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }).end(buffer);
    });

    event.image = (uploadResult as { secure_url: string }).secure_url;

    console.log('Creating event with data:', { title: event.title });

    const createdEvent = await Event.create(event);

    console.log('Event created successfully:', { id: createdEvent._id, slug: createdEvent.slug });

    return NextResponse.json({ message: 'Event created successfully', event: createdEvent }, { status: 201 });

  } catch (e) {
    // Log full error server-side for debugging
    console.error('[POST /api/events] Error:', {
      message: e instanceof Error ? e.message : 'Unknown error',
      stack: e instanceof Error ? e.stack : undefined,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      context: { eventTitle: (event as any)?.title || 'unknown' },
    });

    // Return generic message to client
    const response: { message: string; error?: string } = {
      message: 'Event creation failed',
    };

    // Only include detailed error info in development
    if (process.env.NODE_ENV === 'development' && e instanceof Error) {
      response.error = e.message;
    }

    return NextResponse.json(response, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    // Parse and validate query parameters
    const searchParams = req.nextUrl.searchParams;

    // Parse page parameter (default: 1, min: 1, max: 1000)
    let page = parseInt(searchParams.get('page') || '1', 10);
    page = Math.max(1, Math.min(page, 1000));

    // Parse limit parameter (default: 10, min: 1, max: 100)
    let limit = parseInt(searchParams.get('limit') || '10', 10);
    limit = Math.max(1, Math.min(limit, 100));

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Fetch total count for metadata
    const total = await Event.countDocuments();

    // Fetch paginated events
    const events = await Event.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json(
      {
        message: 'Events fetched successfully',
        data: {
          events,
          pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNextPage,
            hasPrevPage,
          },
        },
      },
      { status: 200 }
    );
  } catch (e) {
    // Log full error server-side for debugging
    console.error('[GET /api/events] Error:', {
      message: e instanceof Error ? e.message : 'Unknown error',
      stack: e instanceof Error ? e.stack : undefined,
      timestamp: new Date().toISOString(),
    });

    // Return generic message to client (no error details or object)
    return NextResponse.json(
      { message: 'Event fetching failed' },
      { status: 500 }
    );
  }
}

// a route that accepts slug as input and returns the event details

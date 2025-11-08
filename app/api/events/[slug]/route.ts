import Event from '@/database/event.model';
import { connectToDatabase } from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Type definition for route parameters
 */
interface RouteParams {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * GET /api/events/[slug]
 * Fetch event details by URL-friendly slug
 */
export async function GET(
  req: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    // Await params in Next.js 13+
    const { slug } = await params;

    // Validate slug parameter
    if (!slug || typeof slug !== 'string') {
      return NextResponse.json(
        { message: 'Invalid or missing slug parameter' },
        { status: 400 }
      );
    }

    if (slug.trim() === '') {
      return NextResponse.json(
        { message: 'Slug cannot be empty' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Query event by slug (case-insensitive for safety)
    const event = await Event.findOne({ slug: slug.toLowerCase() });

    // Debug log
    console.log(`Querying for slug: "${slug.toLowerCase()}"`, event);

    // Handle event not found
    if (!event) {
      return NextResponse.json(
        { message: `Event with slug "${slug}" not found` },
        { status: 404 }
      );
    }

    // Return event data
    return NextResponse.json(
      { message: 'Event fetched successfully', event },
      { status: 200 }
    );
  } catch (error) {
    // Handle database connection errors
    if (error instanceof Error && error.message.includes('MONGODB_URI')) {
      return NextResponse.json(
        { message: 'Database connection failed' },
        { status: 500 }
      );
    }

    // Log unexpected errors for debugging
    console.error('[GET /api/events/[slug]] Error:', error);

    // Return generic error response
    return NextResponse.json(
      {
        message: 'Failed to fetch event',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

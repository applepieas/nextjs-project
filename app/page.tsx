import EventCard from '@/components/EventCard'
import ExploreBtn from '@/components/ExploreBtn'
import { IEvent } from '@/database';

/**
 * Error UI component for displaying fetch/data errors
 */
function ErrorFallback({ message }: { message: string }) {
  return (
    <section className="py-20 text-center">
      <h2 className="text-2xl font-bold text-red-500 mb-4">Unable to Load Events</h2>
      <p className="text-light-200 mb-8">{message}</p>
      <button
        onClick={() => window.location.reload()}
        className="bg-primary hover:bg-primary/90 px-6 py-2 rounded-lg text-black font-semibold"
      >
        Try Again
      </button>
    </section>
  );
}

const page = async () => {
  try {
    // Validate BASE_URL is defined
    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
    if (!BASE_URL) {
      console.error('[app/page.tsx] NEXT_PUBLIC_BASE_URL is not defined');
      return <ErrorFallback message="Configuration error: Unable to connect to the server. Please try again later." />;
    }

    // Fetch events with error handling
    const response = await fetch(`${BASE_URL}/api/events`, {
      cache: 'no-store',
    });

    // Check for HTTP errors
    if (!response.ok) {
      throw new Error(`API returned ${response.status}: ${response.statusText}`);
    }

    // Parse JSON with error handling
    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      throw new Error(`Invalid JSON response from API: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
    }

    // Validate response shape and provide safe default
    const events = Array.isArray(data?.data?.events) ? data.data.events : Array.isArray(data?.events) ? data.events : [];

    return (
      <section>
        <h1 className="text-center">The Hub for Every Dev <br /> Event You Can&apos;t Miss</h1>
        <p className="text-center mt-5">Hackathons, Meetups, and Conferences, All in One Place</p>

        <ExploreBtn />

        <div className="mt-20 space-y-7">
          <h3>Featured Events</h3>

          {events.length > 0 ? (
            <ul className="events list-none">
              {events.map((event: IEvent) => (
                <li key={event.title}>
                  <EventCard {...event} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-10">
              <p className="text-light-200">No events available at the moment. Check back soon!</p>
            </div>
          )}
        </div>
      </section>
    );
  } catch (error) {
    // Log full error server-side for debugging
    console.error('[app/page.tsx] Error fetching events:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });

    // Return user-friendly error UI
    const errorMessage =
      error instanceof Error && error.message.includes('API returned')
        ? 'The server is currently unavailable. Please try again later.'
        : error instanceof Error && error.message.includes('Invalid JSON')
          ? 'There was an error processing the response. Please refresh the page.'
          : 'Failed to load events. Please check your connection and try again.';

    return <ErrorFallback message={errorMessage} />;
  }
}

export default page
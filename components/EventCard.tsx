'use client'

import Image from "next/image";
import Link from "next/link";

interface Props {
  title: string;
  image: string;
  slug: string;
  location: string;
  date: string;
  time: string;
}

const EventCard = ({ title, image, slug, location, date, time }: Props) => {
  return (
    <Link href={`/events/${title}`} className="event-card">
      <Image src={image} alt={title} width={410} height={300} className="poster rounded-md" style={{ width: '100%', height: 'auto' }} />

      <div className="flex flex-row gap-2">
        <Image src="/icons/pin.svg" alt="location-pin" width={14} height={14} />
        <p>{location}</p>
      </div>

      <p className="title">{title}</p>

      <div className="datetime">
        <div>
          <Image src="/icons/calendar.svg" alt="date" width={14} height={14} />
          <p>{date}</p>
        </div>
        <div>
          <Image src="/icons/clock.svg" alt="time" width={14} height={14} />
          <p>{time}</p>
        </div>
      </div>

    </Link>
  )
}

export default EventCard
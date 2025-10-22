import CarouselClient from "./CarouselClient";

export default async function Carousel({
  carouselMida,
  title,
  showTitle = true,
  className = "",
}) {
  // Early return if no data (Server-side)
  if (!carouselMida?.length) {
    return null;
  }
  // ✅ Prepare data على السيرفر
  const optimizedData = carouselMida.map((media) => ({
    id: media.id,
    title: media.title,
    poster: media.poster,
    titleAr: media.titleAr,
    isNew: media.isNew,
    quality: media.quality,
    rating: media.rating,
    year: media.year,
    duration: media.duration,
    genre: media.genre,
  }));

  // Pass للـ Client Component
  return (
    <CarouselClient
      carouselMida={optimizedData}
      title={title}
      showTitle={showTitle}
      className={className}
    />
  );
}

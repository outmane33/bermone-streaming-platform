import CarouselClient from "./CarouselClient";

export default async function Carousel({
  carouselMida,
  title,
  showTitle = true,
  className = "",
}) {
  if (!carouselMida?.length) {
    return null;
  }
  const optimizedData = carouselMida;

  return (
    <CarouselClient
      carouselMida={optimizedData}
      title={title}
      showTitle={showTitle}
      className={className}
    />
  );
}

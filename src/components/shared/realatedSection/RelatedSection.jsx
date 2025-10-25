import Card from "@/components/shared/card/Card";
import { DESIGN_TOKENS } from "@/lib/data";

export default function RelatedSection({ relatedMedia, title }) {
  return (
    <div className="relative">
      {/* Section Header */}
      <div className="mb-8">
        <h2 className="text-3xl sm:text-4xl font-black text-white bg-gradient-to-r from-cyan-300 via-white to-purple-300 bg-clip-text text-right">
          {title}
        </h2>
        <div className="h-1 bg-gradient-to-l from-cyan-500 via-purple-500 to-transparent rounded-full mt-3"></div>
      </div>

      {/* Media Grid */}
      <div className={DESIGN_TOKENS.grid.container}>
        {relatedMedia.map((media, index) => (
          <Card key={index} media={media} />
        ))}
      </div>
    </div>
  );
}

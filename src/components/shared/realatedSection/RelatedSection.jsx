import Card from "@/components/shared/card/Card";
import { DESIGN_TOKENS } from "@/lib/data";
import { EpisodeTag } from "../card/EpisodeTag";

export default function RelatedSection({ relatedMedia, title }) {
  const type = relatedMedia[0]?.type;

  return (
    <div className="relative">
      {/* Section Header */}
      <div className="mb-8">
        <h2 className="text-3xl sm:text-4xl font-black text-white bg-gradient-to-r from-cyan-300 via-white to-purple-300 bg-clip-text text-right px-2">
          {title}
        </h2>
        <div className="h-1 bg-gradient-to-l from-cyan-500 via-purple-500 to-transparent rounded-full mt-3"></div>
      </div>

      {/* Media Grid or Episode List */}
      {type === "episode" ? (
        <div className="relative">
          <div className="max-h-96 overflow-y-auto pr-2 pb-2">
            <div className={DESIGN_TOKENS.grid.container}>
              {relatedMedia.map((media, index) => (
                <EpisodeTag key={index} episode={media} />
              ))}
            </div>
          </div>

          {relatedMedia.length > 12 && (
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
          )}
        </div>
      ) : (
        <div className={DESIGN_TOKENS.grid.container}>
          {relatedMedia.map((media, index) => (
            <Card key={index} media={media} />
          ))}
        </div>
      )}
    </div>
  );
}

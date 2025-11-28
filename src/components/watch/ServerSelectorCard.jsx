import React from "react";
import { DESIGN_TOKENS, ICON_MAP } from "@/lib/data";
import Link from "next/link";
import Button from "../shared/heroSection/Button";

export default function ServerSelectorCard({
  servers,
  activeServerIdx,
  onServerChange,
  isLoading = false,
  slug,
}) {
  if (isLoading) return null;
  if (!servers?.length) return null;

  // Ensure slug starts with / for absolute path navigation
  const cleanSlug = slug?.startsWith("/") ? slug : `/${slug}`;

  return (
    <div className={`${DESIGN_TOKENS.glass.medium} rounded-xl p-4 shadow-xl`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 mb-3">
          <ICON_MAP.Server className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <h2 className="text-base font-semibold text-white">اختر السيرفر</h2>
        </div>
        <Link href={cleanSlug}>
          <Button variant="secondary" size="small" icon={ICON_MAP.ArrowLeft}>
            عودة للتفاصيل
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {servers.map((server, i) => (
          <button
            key={server.id}
            onClick={() => onServerChange(i)}
            disabled={server.status === "maintenance"}
            className={`
              px-3 py-2.5 xs:px-4 xs:py-3 rounded-lg font-medium truncate
              transition-all hover:scale-[1.03]
              ${
                i === activeServerIdx
                  ? `bg-gradient-to-r ${DESIGN_TOKENS.gradients.cyan}`
                  : `${DESIGN_TOKENS.glass.light} ${DESIGN_TOKENS.glass.hover}`
              }
              ${server.status === "maintenance" ? "opacity-50" : ""}
            `}
          >
            <div className="flex items-center justify-center gap-1.5">
              {server.status === "active" ? (
                <ICON_MAP.CheckCircle className="w-3.5 h-3.5 text-white" />
              ) : (
                <ICON_MAP.AlertCircle className="w-3.5 h-3.5 text-yellow-400" />
              )}
              <span className="text-white text-xs xs:text-sm truncate">
                {server.name}
              </span>
            </div>
          </button>
        ))}
      </div>

      {servers[activeServerIdx]?.status === "maintenance" && (
        <div className="mt-3 p-3 bg-yellow-500/10 rounded-lg">
          <p className="text-yellow-400 text-xs text-center">
            هذا السيرفر تحت الصيانة، يرجى اختيار سيرفر آخر
          </p>
        </div>
      )}
    </div>
  );
}

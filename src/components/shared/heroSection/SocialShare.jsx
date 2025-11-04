"use client";

import { useState, useEffect } from "react";
import { SOCIAL_LINKS, DESIGN_TOKENS } from "@/lib/data";

function SocialButton({ icon: Icon, gradient, onClick, ariaLabel }) {
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      className={`group relative p-2 
        bg-white/5 md:${DESIGN_TOKENS.glass.light.split(" ").join(" md:")}
        rounded-lg cursor-pointer transition-colors
      `}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-20 rounded-lg ${DESIGN_TOKENS.effects.transition}`}
      />
      <div className="relative text-gray-300 group-hover:text-white">
        <Icon size={18} />
      </div>
    </button>
  );
}

export default function SocialShare({
  title = "شارك مع اصدقائك :",
  onShare,
  className = "",
  shareTitle = "",
  shareDescription = "",
}) {
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    setShareUrl(window.location.href);
  }, []);

  const handleShare = (platform) => {
    onShare?.(platform);

    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(shareTitle);
    const fullText = encodeURIComponent(
      `${shareTitle}${shareDescription ? " - " + shareDescription : ""}`
    );

    const shareLinks = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
      whatsapp: `https://wa.me/?text=${fullText}%20${encodedUrl}`,
    };

    const shareLink = shareLinks[platform.toLowerCase()];
    if (shareLink) {
      window.open(
        shareLink,
        "_blank",
        "width=600,height=400,noopener,noreferrer"
      );
    }
  };

  if (!shareUrl) return null;

  return (
    <div
      className={`flex items-center justify-end gap-3 pt-4 border-t border-white/10 ${className}`}
    >
      <span className="text-sm text-gray-200 font-semibold">{title}</span>
      <div className="flex gap-2">
        {SOCIAL_LINKS.map((social) => (
          <SocialButton
            key={social.name}
            icon={social.icon}
            gradient={social.gradient}
            ariaLabel={social.ariaLabel}
            onClick={() => handleShare(social.name)}
          />
        ))}
      </div>
    </div>
  );
}

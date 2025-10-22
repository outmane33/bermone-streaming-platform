// SocialShare.jsx
import { SOCIAL_LINKS } from "@/lib/data";

function SocialButton({ icon: Icon, gradient, onClick, ariaLabel }) {
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      className="group relative p-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:scale-110 cursor-pointer"
    >
      <div
        className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-20 rounded-lg transition-opacity duration-300`}
      />
      <div className="relative text-gray-300 group-hover:text-white transition-colors">
        <Icon size={18} />
      </div>
    </button>
  );
}

export default function SocialShare({
  title = "شارك مع اصدقائك :",
  onShare,
  className = "",
  shareUrl = typeof window !== "undefined" ? window.location.href : "",
  shareTitle = "",
  shareDescription = "",
}) {
  const handleShare = (platform) => {
    // Call the optional callback
    onShare?.(platform);

    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(shareTitle);
    const encodedDescription = encodeURIComponent(shareDescription);
    const fullText = encodeURIComponent(
      `${shareTitle}${shareDescription ? " - " + shareDescription : ""}`
    );

    let shareLink = "";

    switch (platform.toLowerCase()) {
      case "facebook":
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;

      case "twitter":
        shareLink = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
        break;

      case "telegram":
        shareLink = `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`;
        break;

      case "whatsapp":
        shareLink = `https://wa.me/?text=${fullText}%20${encodedUrl}`;
        break;

      default:
        console.log("Unknown platform:", platform);
        return;
    }

    // Open share link in a new window
    if (shareLink) {
      window.open(
        shareLink,
        "_blank",
        "width=600,height=400,noopener,noreferrer"
      );
    }
  };

  // Helper function to copy to clipboard
  const copyToClipboard = (text) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          console.log("Link copied to clipboard");
        })
        .catch((err) => {
          console.error("Failed to copy:", err);
          fallbackCopy(text);
        });
    } else {
      fallbackCopy(text);
    }
  };

  // Fallback copy method for older browsers
  const fallbackCopy = (text) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand("copy");
      console.log("Link copied using fallback method");
    } catch (err) {
      console.error("Fallback copy failed:", err);
    }
    document.body.removeChild(textArea);
  };

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

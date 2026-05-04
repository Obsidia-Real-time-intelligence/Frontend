import { Send, MessageCircle } from "lucide-react";

interface CommunityLinksProps {
  /** Smaller buttons for the dense in-app TopBar. */
  compact?: boolean;
}

/**
 * Telegram + Discord icon buttons, rendered only when their env links exist.
 * Reads `NEXT_PUBLIC_TELEGRAM_INVITE` + `NEXT_PUBLIC_DISCORD_INVITE`.
 */
export function CommunityLinks({ compact }: CommunityLinksProps) {
  const tg = process.env.NEXT_PUBLIC_TELEGRAM_INVITE;
  const dc = process.env.NEXT_PUBLIC_DISCORD_INVITE;
  if (!tg && !dc) return null;

  const size = compact ? "size-7" : "size-8";
  const icon = compact ? "size-3.5" : "size-4";

  return (
    <div className="flex items-center gap-1">
      {tg && (
        <a
          href={tg}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Join Telegram community"
          title="Join Telegram"
          className={`grid ${size} place-items-center rounded-md text-[var(--color-muted-foreground)] hover:text-[#229ED9] hover:bg-[#229ED9]/10 transition-colors`}
        >
          <Send className={icon} />
        </a>
      )}
      {dc && (
        <a
          href={dc}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Join Discord community"
          title="Join Discord"
          className={`grid ${size} place-items-center rounded-md text-[var(--color-muted-foreground)] hover:text-[#5865F2] hover:bg-[#5865F2]/10 transition-colors`}
        >
          <MessageCircle className={icon} />
        </a>
      )}
    </div>
  );
}

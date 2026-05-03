import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

type Variant = "default" | "icon" | "banner";

interface LogoProps {
  className?: string;
  /**
   * default = shard + "Obsidia" wordmark (best for sidebar/nav)
   * icon    = just the shard
   * banner  = the wide pre-rendered banner (best for marketing hero / footer)
   */
  variant?: Variant;
  href?: string | null;
}

export function Logo({
  className,
  variant = "default",
  href = "/",
}: LogoProps) {
  const inner = (() => {
    if (variant === "icon") {
      return (
        <Image
          src="/logo.png"
          alt="Obsidia"
          width={32}
          height={32}
          priority
          className="h-7 w-auto"
        />
      );
    }
    if (variant === "banner") {
      return (
        <Image
          src="/logo_banner.png"
          alt="Obsidia"
          width={995}
          height={402}
          priority
          className="h-9 w-auto"
        />
      );
    }
    // default: shard image + clean wordmark text
    return (
      <>
        <Image
          src="/logo.png"
          alt=""
          width={32}
          height={32}
          priority
          className="h-7 w-auto"
        />
        <span className="text-sm font-semibold tracking-tight text-foreground">
          Obsidia
        </span>
      </>
    );
  })();

  const wrapped = (
    <span className={cn("inline-flex items-center gap-2 select-none", className)}>
      {inner}
    </span>
  );

  if (!href) return wrapped;

  return (
    <Link href={href} className="inline-flex items-center gap-2 select-none">
      {inner}
    </Link>
  );
}

import Image from "next/image";
import type { PublicImage } from "@/cms/queries";

export function CmsImage({ image, className = "", sizes }: { image: PublicImage; className?: string; sizes: string }) {
  return <Image src={image.url} alt={image.alt} width={image.width} height={image.height} sizes={sizes} className={className} />;
}

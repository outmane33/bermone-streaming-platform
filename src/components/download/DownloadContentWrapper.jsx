import { notFound } from "next/navigation";
import { getAvailableQualities } from "@/actions/download";
import SecureDownloadClient from "@/components/download/SecureDownloadClient";

export default async function DownloadContentWrapper({ slug }) {
  const result = await getAvailableQualities(slug);

  if (!result.success || result.qualities.length === 0) {
    notFound();
  }

  return (
    <SecureDownloadClient
      qualities={result.qualities}
      slug={slug}
      contentType={result.type}
    />
  );
}

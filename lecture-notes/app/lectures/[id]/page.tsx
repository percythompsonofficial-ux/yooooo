import LectureDetail from "@/components/LectureDetail";

/**
 * The lecture itself lives in IndexedDB, so the actual page is a client
 * component. This server shell exists only to unwrap the async params that
 * Next 16 hands down.
 */
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <LectureDetail id={id} />;
}

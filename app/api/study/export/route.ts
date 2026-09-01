import { buildApkg, type ExportCard } from "@/lib/study/anki";
import { cardsForExport, getCourse, getLecture } from "@/lib/study/db";

export const dynamic = "force-dynamic";

function filename(name: string): string {
  const safe = name.replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-") || "study";
  return `${safe}.apkg`;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const courseId = url.searchParams.get("courseId") ?? undefined;
  const lectureId = url.searchParams.get("lectureId") ?? undefined;

  if (!courseId && !lectureId) {
    return Response.json(
      { error: "Pass a courseId or a lectureId to export." },
      { status: 400 },
    );
  }

  try {
    const cards = await cardsForExport(courseId, lectureId);
    if (cards.length === 0) {
      return Response.json({ error: "Nothing to export yet." }, { status: 404 });
    }

    const label = lectureId
      ? ((await getLecture(lectureId))?.title ?? "Lecture")
      : ((await getCourse(courseId!))?.name ?? "Course");

    const deckName = `Study::${cards[0].course_name}${
      lectureId ? `::${label}` : ""
    }`;

    const apkg = await buildApkg(cards as ExportCard[], deckName);

    return new Response(apkg as unknown as BodyInit, {
      headers: {
        "content-type": "application/octet-stream",
        "content-disposition": `attachment; filename="${filename(label)}"`,
        "content-length": String(apkg.byteLength),
      },
    });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Export failed." },
      { status: 500 },
    );
  }
}

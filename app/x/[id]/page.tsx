import { notFound } from "next/navigation";
import ExerciseClient from "../../../components/ExerciseClient";
import { Shell } from "../../../components/Shell";
import { EXERCISES, byId } from "../../../content";

export const dynamicParams = false;
export function generateStaticParams() {
  return EXERCISES.map((e) => ({ id: e.id }));
}
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return { title: `${byId(id)?.title ?? "Exercise"} · Practice Bench` };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!byId(id)) notFound();
  return (
    <Shell toc={[{ id: "problem", label: "The problem" }, { id: "hints", label: "Hints" }, { id: "solution", label: "Worked solution" }]}>
      <ExerciseClient id={id} />
    </Shell>
  );
}

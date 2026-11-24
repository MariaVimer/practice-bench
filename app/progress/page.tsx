import { ProgressView } from "../../components/ProgressView";
import { Shell } from "../../components/Shell";

export const metadata = { title: "Progress · Practice Bench" };

export default function Page() {
  return (
    <Shell toc={[{ id: "summary", label: "At a glance" }, { id: "save", label: "Save your progress" }, { id: "skills", label: "By skill" }, { id: "domains", label: "By domain" }, { id: "how", label: "How it's counted" }]}>
      <ProgressView />
    </Shell>
  );
}

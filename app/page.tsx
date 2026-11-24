import { HomeList } from "../components/HomeList";
import { Faq } from "../components/Faq";
import { HowItWorks } from "../components/HowItWorks";
import { ShareButton } from "../components/ShareButton";
import { Shell } from "../components/Shell";
import { EXERCISES } from "../content";
import { CLUSTERS, type Cluster } from "../lib/types";

export default function Home() {
  const clusters = (Object.keys(CLUSTERS) as Cluster[]).filter((c) => EXERCISES.some((e) => e.cluster === c));
  return (
    <Shell>
      <header className="masthead">
        <div className="title-row">
          <h1 className="title">Practice Bench</h1>
          <ShareButton title="Practice Bench" />
        </div>
        <p className="statement">
          Questions from the CML sample papers and the i-Ready Grade 6 packet, with hints and worked solutions.
        </p>
      </header>
      <HomeList />
      <Faq n={clusters.length + 1} />
      <HowItWorks />
    </Shell>
  );
}

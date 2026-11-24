import { PrintWorksheet } from "../../components/PrintWorksheet";
import { Shell } from "../../components/Shell";

export const metadata = { title: "Print a worksheet · Practice Bench" };

export default function Page() {
  return (
    <Shell>
      <header className="masthead">
        <div className="title-row"><h1 className="title">Print a worksheet</h1></div>
        <p className="statement">Prefer paper? Pick the sections, check the preview, then print it or save it as a PDF.</p>
      </header>
      <PrintWorksheet />
    </Shell>
  );
}

import { Card, CardHeader, CardTitle } from "../ui/Card";
import { formatCurrencyINR } from "../../utils/formatters";

export interface FeeItem {
  service: string;
  pages: number;
  validity: string;
  normalFee: number;
  tatkaalFee: number;
}

const FEES: FeeItem[] = [
  { service: "Fresh / Re-issue Passport (Adult)", pages: 36, validity: "10 Years", normalFee: 1500, tatkaalFee: 3500 },
  { service: "Fresh / Re-issue Passport (Jumbo)", pages: 60, validity: "10 Years", normalFee: 2000, tatkaalFee: 4000 },
  { service: "Fresh / Re-issue (Minor < 15 yrs)", pages: 36, validity: "5 Years", normalFee: 1000, tatkaalFee: 3000 },
  { service: "Police Clearance Certificate (PCC)", pages: 0, validity: "6 Months", normalFee: 500, tatkaalFee: 500 },
  { service: "Lost / Damaged Passport (Duplicate)", pages: 36, validity: "Remaining", normalFee: 3000, tatkaalFee: 5000 },
];

export function FeeTable() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Government Passport Fee Schedule (MEA 2026)</CardTitle>
        <span className="text-[11px] text-text-muted">Official Passport Rules</span>
      </CardHeader>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-border text-text-secondary text-[11px]">
              <th className="pb-2 font-medium">Service Description</th>
              <th className="pb-2 font-medium">Pages</th>
              <th className="pb-2 font-medium">Validity</th>
              <th className="pb-2 font-medium">Normal Fee</th>
              <th className="pb-2 font-medium">Tatkaal (Urgent)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50 text-text">
            {FEES.map((f, i) => (
              <tr key={i} className="hover:bg-raised/40 transition-colors">
                <td className="py-2.5 font-medium">{f.service}</td>
                <td className="py-2.5 text-text-secondary">{f.pages > 0 ? f.pages : "—"}</td>
                <td className="py-2.5 text-text-secondary">{f.validity}</td>
                <td className="py-2.5 font-semibold text-ok">{formatCurrencyINR(f.normalFee)}</td>
                <td className="py-2.5 font-semibold text-issue">{formatCurrencyINR(f.tatkaalFee)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

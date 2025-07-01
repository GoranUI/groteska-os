
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const FormatGuideCard = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Supported CSV Format</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            Your CSV should have the following structure:
          </p>
          <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm">
            <div>DATUM,TIP TRANSAKCIJE,OPIS,IZNOS</div>
            <div>01.07.2025,PLAĆANJE KARTICOM,Kupovina LOVABLE,"- 2.495,51 RSD"</div>
            <div>30.06.2025,PLAĆANJE KARTICOM,Kupovina Wolt doo,"- 1.619,32 RSD"</div>
            <div>01.07.2025,PLAĆANJE KARTICOM,Kupovina Upwork -822939118REF,"- 5.102,96 RSD"</div>
          </div>
          <p className="text-xs text-gray-500">
            • Dates in DD.MM.YYYY format<br/>
            • Amounts in Serbian format with comma as decimal separator<br/>
            • Expenses are automatically categorized:<br/>
            • Upwork → Office (outsourcing)<br/>
            • Wolt/Glovo → External Food<br/>
            • Pekara → Food<br/>
            • Health services → Utilities
          </p>
        </div>
      </CardContent>
    </Card>
  );
};


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const IncomeFormatGuideCard = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Supported CSV Format for Incomes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            Your CSV should have the following structure for income tracking:
          </p>
          <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm">
            <div>DATUM,TIP TRANSAKCIJE,OPIS,IZNOS</div>
            <div>01.07.2025,UPLATA/ISPLATA,Upwork Payment REF12345,"+ 50.000,00 RSD"</div>
            <div>30.06.2025,BEZGOTOVINSKI PRENOS,Client ABC Payment,"+ 75.000,00 RSD"</div>
            <div>01.07.2025,UPLATA,Freelance Project XYZ,"+ 25.000,00 RSD"</div>
          </div>
          <p className="text-xs text-gray-500">
            • Dates in DD.MM.YYYY format<br/>
            • Amounts in Serbian format with comma as decimal separator<br/>
            • Positive amounts (+) or income-related keywords are automatically detected<br/>
            • Clients are automatically categorized:<br/>
            • Upwork → Full-time<br/>
            • Other transfers → One-time<br/>
            • Client names extracted from transaction descriptions
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

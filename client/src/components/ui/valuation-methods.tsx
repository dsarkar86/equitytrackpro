import { Card, CardContent } from "@/components/ui/card";
import { Valuation } from "@shared/schema";

interface ValuationMethodsProps {
  valuation: Valuation | null;
}

export function ValuationMethods({ valuation }: ValuationMethodsProps) {
  // Format currency
  const formatCurrency = (value?: number) => {
    if (!value && value !== 0) return "N/A";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const valuationMethods = [
    {
      name: "Comparable Sales",
      description: "Based on 5 recent sales in your area",
      value: valuation?.comparableSalesValue,
    },
    {
      name: "Per Square Meter",
      description: "Value calculated by square footage",
      value: valuation?.perSquareFootValue,
    },
    {
      name: "Automated Model",
      description: "Based on market algorithms",
      value: valuation?.automatedModelValue,
    },
    {
      name: "Cost Approach",
      description: "Land + building costs - depreciation",
      value: valuation?.costApproachValue,
    },
    {
      name: "Income Approach",
      description: "Cap rate: 4.8%",
      value: valuation?.incomeApproachValue,
    },
    {
      name: "Equitystek Value",
      description: "Including maintenance history value",
      value: valuation?.equitystekValue,
      highlight: true,
    },
  ];

  if (!valuation) {
    return (
      <>
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-gray-200 animate-pulse rounded-lg"></div>
        ))}
      </>
    );
  }

  return (
    <>
      {valuationMethods.map((method) => (
        <Card
          key={method.name}
          className={`${
            method.highlight ? "bg-primary-50 border-2 border-primary" : "bg-gray-50"
          }`}
        >
          <CardContent className="p-4">
            <h4
              className={`text-base font-medium ${
                method.highlight ? "text-primary-700" : "text-gray-900"
              }`}
            >
              {method.name}
            </h4>
            <p
              className={`mt-1 text-3xl font-semibold ${
                method.highlight ? "text-primary-700" : "text-gray-900"
              }`}
            >
              {formatCurrency(method.value)}
            </p>
            <p
              className={`mt-1 text-sm ${
                method.highlight ? "text-primary-600" : "text-gray-500"
              }`}
            >
              {method.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </>
  );
}

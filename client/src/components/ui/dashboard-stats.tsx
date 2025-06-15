import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { 
  ArrowUpIcon, 
  HomeIcon, 
  Drill, 
  TrendingUpIcon,
  House,
} from "lucide-react";
import { Property, MaintenanceRecord, Valuation } from "@shared/schema";

interface DashboardStatsProps {
  properties: Property[];
  maintenanceRecords: MaintenanceRecord[];
  valuations: Valuation[];
  isLoading?: boolean;
}

export function DashboardStats({ 
  properties, 
  maintenanceRecords, 
  valuations,
  isLoading = false 
}: DashboardStatsProps) {
  // Calculate total portfolio value
  const totalValue = valuations.reduce((sum, valuation) => {
    return sum + valuation.equitystekValue;
  }, 0);

  // Calculate maintenance value
  const totalMaintenanceValue = maintenanceRecords.reduce((sum, record) => {
    return sum + (record.estimatedValueAdded || 0);
  }, 0);

  // Calculate percentage increase from maintenance (if we have data)
  const valueBeforeMaintenance = totalValue - totalMaintenanceValue;
  const valueIncrease = valueBeforeMaintenance > 0
    ? (totalMaintenanceValue / valueBeforeMaintenance) * 100
    : 0;

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {/* Portfolio Value Card */}
      <Card>
        <CardContent className="px-4 py-5 sm:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-primary rounded-md p-3">
              <TrendingUpIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Portfolio Value</dt>
                <dd className="flex items-baseline">
                  {isLoading ? (
                    <div className="h-8 w-36 bg-gray-200 animate-pulse rounded" />
                  ) : (
                    <>
                      <div className="text-2xl font-semibold text-gray-900">
                        ${totalValue.toLocaleString()}
                      </div>
                      {valueIncrease > 0 && (
                        <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                          <ArrowUpIcon className="self-center flex-shrink-0 h-4 w-4 text-green-500" aria-hidden="true" />
                          <span className="sr-only">Increased by</span>
                          {valueIncrease.toFixed(1)}%
                        </div>
                      )}
                    </>
                  )}
                </dd>
              </dl>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Property Count Card */}
      <Card>
        <CardContent className="px-4 py-5 sm:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-secondary-500 rounded-md p-3">
              <HomeIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Properties</dt>
                <dd className="flex items-baseline">
                  {isLoading ? (
                    <div className="h-8 w-16 bg-gray-200 animate-pulse rounded" />
                  ) : (
                    <div className="text-2xl font-semibold text-gray-900">
                      {properties.length}
                    </div>
                  )}
                </dd>
              </dl>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Maintenance Records Card */}
      <Card>
        <CardContent className="px-4 py-5 sm:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-amber-500 rounded-md p-3">
              <Drill className="h-6 w-6 text-white" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Maintenance Records</dt>
                <dd className="flex items-baseline">
                  {isLoading ? (
                    <div className="h-8 w-16 bg-gray-200 animate-pulse rounded" />
                  ) : (
                    <div className="text-2xl font-semibold text-gray-900">
                      {maintenanceRecords.length}
                    </div>
                  )}
                </dd>
              </dl>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

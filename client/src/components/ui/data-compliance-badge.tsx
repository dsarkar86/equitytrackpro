import React from 'react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Shield, Lock, Check } from 'lucide-react';

export function DataComplianceBadge() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="inline-flex items-center gap-1.5 rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20 cursor-help">
            <Shield className="h-3 w-3" />
            <span>AU Data Compliant</span>
          </div>
        </TooltipTrigger>
        <TooltipContent className="w-80">
          <div className="space-y-3 p-1">
            <h4 className="font-medium">Australian Data Compliance</h4>
            <p className="text-xs text-muted-foreground">
              Equitystek stores all your data within Australian borders in compliance with
              Australian Privacy Principles (APPs) under the Privacy Act 1988.
            </p>
            <div className="space-y-1">
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5" />
                <span className="text-xs">All personal and property data stored in Australia</span>
              </div>
              <div className="flex items-start gap-2">
                <Lock className="h-4 w-4 text-green-500 mt-0.5" />
                <span className="text-xs">Enhanced encryption and security measures</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5" />
                <span className="text-xs">Regular security audits and compliance checks</span>
              </div>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
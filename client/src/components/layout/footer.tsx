import React from 'react';
import { PrivacyPolicyDialog } from '@/components/policy/privacy-policy';
import { TermsOfServiceDialog } from '@/components/policy/terms-of-service';

export function Footer() {
  return (
    <footer className="w-full border-t py-6 px-6 md:px-8 bg-background">
      <div className="container mx-auto">
        <div className="flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Equitystek. All rights reserved.
          </p>
          
          {/* Australian Data Compliance Statement */}
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span className="text-xs text-muted-foreground">
                Australian-based Data Storage
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <PrivacyPolicyDialog />
              <TermsOfServiceDialog />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
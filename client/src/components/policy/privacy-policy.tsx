import React from 'react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export function PrivacyPolicyDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="link" className="text-xs text-muted-foreground">
          Privacy Policy
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Privacy Policy</DialogTitle>
          <DialogDescription>
            Updated May 2025
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="mt-4 h-[60vh] pr-4">
          <div className="space-y-4 text-sm">
            <section>
              <h3 className="text-base font-semibold">Australian Data Compliance Statement</h3>
              <p className="mt-2">
                Equitystek is committed to complying with the Australian Privacy Principles (APPs) under the Privacy Act 1988. 
                We maintain all customer data, including personal information and property details, within Australian borders 
                to meet data sovereignty requirements.
              </p>
            </section>
            
            <section>
              <h3 className="text-base font-semibold">Australian Data Storage</h3>
              <p className="mt-2">
                All personal information collected through our platform is stored exclusively on servers located in Australia. 
                We do not transfer your data outside of Australian jurisdiction unless explicitly required and authorized by you.
              </p>
            </section>
            
            <section>
              <h3 className="text-base font-semibold">Information We Collect</h3>
              <p className="mt-2">We collect the following categories of information:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Personal details (name, email, contact information)</li>
                <li>Property information (address, characteristics, valuation data)</li>
                <li>Maintenance records</li>
                <li>Payment information (processed securely through Stripe)</li>
                <li>Usage data and platform analytics</li>
              </ul>
            </section>
            
            <section>
              <h3 className="text-base font-semibold">How We Use Your Information</h3>
              <p className="mt-2">Your information is used exclusively for:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Providing property management and valuation services</li>
                <li>Processing maintenance requests</li>
                <li>Subscription management</li>
                <li>Improving the platform experience</li>
                <li>Communication regarding your account and properties</li>
              </ul>
              <p className="mt-2">
                We do not sell your data to third parties. Information sharing is limited to service providers 
                necessary for platform operations, all of whom maintain Australian data residency requirements.
              </p>
            </section>
            
            <section>
              <h3 className="text-base font-semibold">Security Measures</h3>
              <p className="mt-2">
                We implement robust security measures to protect your data, including:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Encryption of sensitive data at rest and in transit</li>
                <li>Secure authentication and authorization systems</li>
                <li>Regular security updates and vulnerability assessments</li>
                <li>Physical security measures for hosting facilities</li>
                <li>Access controls and audit logging</li>
              </ul>
            </section>
            
            <section>
              <h3 className="text-base font-semibold">Your Rights</h3>
              <p className="mt-2">
                Under Australian privacy laws, you have the right to:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Access your personal information</li>
                <li>Request correction of inaccurate information</li>
                <li>Request deletion of your data (subject to legal requirements)</li>
                <li>Lodge a complaint about privacy violations</li>
                <li>Opt out of marketing communications</li>
              </ul>
            </section>
            
            <section>
              <h3 className="text-base font-semibold">Data Retention</h3>
              <p className="mt-2">
                We retain your data for as long as necessary to provide our services and comply with legal obligations. 
                Upon account termination, we implement a data deletion schedule in accordance with Australian requirements, 
                typically within 90 days of account closure.
              </p>
            </section>
            
            <section>
              <h3 className="text-base font-semibold">Contact Information</h3>
              <p className="mt-2">
                If you have questions about our privacy practices or wish to exercise your privacy rights, 
                please contact our Privacy Officer at:
              </p>
              <p className="mt-2">
                Email: privacy@equitystek.com.au<br />
                Address: 123 Sydney Street, Sydney, NSW 2000
              </p>
            </section>
          </div>
        </ScrollArea>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function PrivacyPolicyLink() {
  return (
    <a href="#" className="text-xs text-muted-foreground hover:underline">
      Privacy Policy
    </a>
  );
}
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

export function TermsOfServiceDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="link" className="text-xs text-muted-foreground">
          Terms of Service
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Terms of Service</DialogTitle>
          <DialogDescription>
            Updated May 2025
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="mt-4 h-[60vh] pr-4">
          <div className="space-y-4 text-sm">
            <section>
              <h3 className="text-base font-semibold">1. Agreement to Terms</h3>
              <p className="mt-2">
                By accessing or using the Equitystek platform, you agree to be bound by these Terms of Service,
                which are governed by the laws of Australia. If you disagree with any part of these terms,
                you may not access the service.
              </p>
            </section>
            
            <section>
              <h3 className="text-base font-semibold">2. Australian Data Sovereignty</h3>
              <p className="mt-2">
                Equitystek complies with Australian data sovereignty requirements. All personal and property data 
                submitted to our platform is stored exclusively on servers located within Australia. We maintain 
                strict controls to ensure data remains within Australian jurisdiction unless explicitly authorized 
                by you.
              </p>
              <p className="mt-2">
                Our compliance includes adherence to:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Privacy Act 1988 and Australian Privacy Principles (APPs)</li>
                <li>Consumer Data Right (CDR) regulations when applicable</li>
                <li>Security of Critical Infrastructure Act 2018 requirements</li>
                <li>Australian Prudential Regulation Authority (APRA) standards</li>
              </ul>
            </section>
            
            <section>
              <h3 className="text-base font-semibold">3. Subscription Terms</h3>
              <p className="mt-2">
                Access to Equitystek requires an active subscription. Subscription fees are charged in Australian 
                dollars (AUD) and processed securely through Stripe. Subscriptions automatically renew unless 
                cancelled at least 24 hours before the renewal date.
              </p>
            </section>
            
            <section>
              <h3 className="text-base font-semibold">4. Data Protection and Security</h3>
              <p className="mt-2">
                We implement industry-standard security measures to protect your data from unauthorized access, 
                alteration, disclosure, or destruction. All data is encrypted at rest and in transit. Access to 
                data is strictly controlled and audited.
              </p>
              <p className="mt-2">
                In the event of a data breach affecting your personal information, we will notify you in accordance
                with the requirements of the Notifiable Data Breaches scheme under the Privacy Act 1988.
              </p>
            </section>
            
            <section>
              <h3 className="text-base font-semibold">5. User Responsibilities</h3>
              <p className="mt-2">
                You agree to:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Provide accurate and complete information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Notify us immediately of any unauthorized access</li>
                <li>Use the service in compliance with Australian laws</li>
                <li>Respect the privacy and rights of other users</li>
              </ul>
            </section>
            
            <section>
              <h3 className="text-base font-semibold">6. Intellectual Property</h3>
              <p className="mt-2">
                Equitystek and its original content, features, and functionality are owned by Equitystek and 
                are protected by Australian and international copyright, trademark, and other intellectual property laws.
              </p>
            </section>
            
            <section>
              <h3 className="text-base font-semibold">7. User Content</h3>
              <p className="mt-2">
                You retain ownership of the content you upload to our platform. By uploading content, you grant us 
                a limited license to store, process, and display that content solely for the purpose of providing our services.
              </p>
            </section>
            
            <section>
              <h3 className="text-base font-semibold">8. Data Deletion</h3>
              <p className="mt-2">
                Upon account termination, we implement a data deletion policy in accordance with Australian 
                retention requirements. Non-essential data is deleted within 90 days, while legally required 
                records may be retained for the period specified by applicable regulations.
              </p>
            </section>
            
            <section>
              <h3 className="text-base font-semibold">9. Limitation of Liability</h3>
              <p className="mt-2">
                To the maximum extent permitted by law, Equitystek shall not be liable for any indirect, 
                incidental, special, consequential, or punitive damages resulting from your use or inability 
                to use the service. This limitation applies to all claims regardless of their basis in contract, 
                tort, or any other legal theory.
              </p>
              <p className="mt-2">
                Your rights as a consumer under the Australian Consumer Law are not affected by these terms.
              </p>
            </section>
            
            <section>
              <h3 className="text-base font-semibold">10. Changes to Terms</h3>
              <p className="mt-2">
                We reserve the right to modify these terms at any time. We will provide notice of significant 
                changes through the platform or via email. Your continued use of the service after such modifications 
                constitutes your acceptance of the updated terms.
              </p>
            </section>
            
            <section>
              <h3 className="text-base font-semibold">11. Contact Information</h3>
              <p className="mt-2">
                If you have questions about these Terms of Service, please contact us at:
              </p>
              <p className="mt-2">
                Email: legal@equitystek.com.au<br />
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

export function TermsOfServiceLink() {
  return (
    <a href="#" className="text-xs text-muted-foreground hover:underline">
      Terms of Service
    </a>
  );
}
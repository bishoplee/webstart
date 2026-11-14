"use client";

import * as React from "react";
import { CheckCircle2, Mail, MapPin, Phone } from "lucide-react";
import { PublicShell } from "@/components/layout/public-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function ContactPage() {
  const [submitted, setSubmitted] = React.useState(false);
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [organisation, setOrganisation] = React.useState("");
  const [message, setMessage] = React.useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    setSubmitted(true);
  }

  return (
    <PublicShell>
      <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-5">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-blue">
                Contact & Support
              </p>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight">
                Start Your Discovery Conversation
              </h1>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                Need an invitation link for your upcoming website project, or need
                assistance with an active discovery questionnaire? Reach out to our
                agency onboarding team.
              </p>
            </div>

            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 size-4 text-brand-blue" />
                <div>
                  <p className="font-medium">Onboarding Desk</p>
                  <p className="text-muted-foreground">onboarding@webstart.agency</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="mt-0.5 size-4 text-brand-blue" />
                <div>
                  <p className="font-medium">Direct Line / WhatsApp</p>
                  <p className="text-muted-foreground">+234 800 WEBSTART</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 size-4 text-brand-blue" />
                <div>
                  <p className="font-medium">Agency Office</p>
                  <p className="text-muted-foreground">
                    Victoria Island, Lagos & Central Business District, Abuja
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Send an Onboarding Inquiry</CardTitle>
                <CardDescription>
                  Tell us about your organisation and our project managers will
                  provision a dedicated discovery workspace for you.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {submitted ? (
                  <Alert variant="success">
                    <CheckCircle2 className="mb-1 size-4" />
                    <AlertTitle>Inquiry Received</AlertTitle>
                    <AlertDescription>
                      Thank you, {name}. Our agency discovery team has logged your
                      request for{" "}
                      <strong>{organisation || "your project"}</strong> and will
                      follow up at <strong>{email}</strong>.
                    </AlertDescription>
                    <div className="mt-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSubmitted(false);
                          setName("");
                          setEmail("");
                          setOrganisation("");
                          setMessage("");
                        }}
                      >
                        Send Another Message
                      </Button>
                    </div>
                  </Alert>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label htmlFor="contact-name">Your Full Name *</Label>
                        <Input
                          id="contact-name"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Funke Adeyemi"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="contact-email">Work Email *</Label>
                        <Input
                          id="contact-email"
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="funke@company.com"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="contact-org">Organisation Name</Label>
                      <Input
                        id="contact-org"
                        value={organisation}
                        onChange={(e) => setOrganisation(e.target.value)}
                        placeholder="e.g. Crestview Holdings Ltd"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="contact-msg">
                        Project Summary or Question *
                      </Label>
                      <Textarea
                        id="contact-msg"
                        required
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Briefly describe the website or web application you are planning..."
                      />
                    </div>

                    <Button type="submit" className="w-full sm:w-auto">
                      Submit Onboarding Inquiry
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PublicShell>
  );
}

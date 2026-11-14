import { beforeEach, describe, expect, it } from "vitest";
import {
  DEFAULT_QUESTIONNAIRE_TEMPLATES,
  getTemplateBlueprintByCategory,
} from "@/lib/questionnaire/default-templates";
import { isQuestionVisible } from "@/lib/questionnaire/conditions";
import { calculateQuestionnaireCompletion } from "@/lib/questionnaire/completion";
import {
  createClientRecord,
  createClarificationRequestRecord,
  createProjectWithSession,
  getPortalSessionByToken,
  resetStoreForTesting,
  respondToClarificationByToken,
  saveQuestionnaireAnswersByToken,
  submitQuestionnaireByToken,
} from "@/lib/data/repository";

const TEST_WORKSPACE = "00000000-0000-4000-8000-000000000010";

describe("Phase 3: Adaptive Questionnaire Engine, Conditional Logic, Autosave & Submission", () => {
  beforeEach(() => {
    resetStoreForTesting(false);
  });

  it("provides all 7 adaptive website category templates with 11 structured sections each", () => {
    expect(DEFAULT_QUESTIONNAIRE_TEMPLATES).toHaveLength(7);
    const categories = DEFAULT_QUESTIONNAIRE_TEMPLATES.map(
      (t) => t.websiteCategory
    );
    expect(categories).toEqual([
      "CORPORATE",
      "ECOMMERCE",
      "EDUCATION",
      "NGO",
      "PORTFOLIO",
      "WEB_APP",
      "CUSTOM",
    ]);

    for (const tpl of DEFAULT_QUESTIONNAIRE_TEMPLATES) {
      expect(tpl.sections).toHaveLength(11);
    }
  });

  it("dynamically evaluates conditional follow-up questions in Section 6 (Online Payments, Booking, User Accounts, E-Commerce)", () => {
    const corpTemplate = getTemplateBlueprintByCategory("CORPORATE");
    const functionalSection = corpTemplate.sections.find(
      (s) => s.sectionKey === "functional_requirements"
    )!;

    const paymentPurposeQuestion = functionalSection.questions.find(
      (q) => q.questionKey === "payment_purpose"
    )!;
    const bookingQuestion = functionalSection.questions.find(
      (q) => q.questionKey === "booking_availability_manager"
    )!;
    const accountsQuestion = functionalSection.questions.find(
      (q) => q.questionKey === "user_accounts_registration_policy"
    )!;
    const ecommerceQuestion = functionalSection.questions.find(
      (q) => q.questionKey === "ecommerce_catalogue_details"
    )!;

    // When only contact_forms is selected, none of the conditional groups are visible
    const basicResponses = { selected_features: ["contact_forms"] };
    expect(isQuestionVisible(paymentPurposeQuestion, basicResponses)).toBe(
      false
    );
    expect(isQuestionVisible(bookingQuestion, basicResponses)).toBe(false);
    expect(isQuestionVisible(accountsQuestion, basicResponses)).toBe(false);
    expect(isQuestionVisible(ecommerceQuestion, basicResponses)).toBe(false);

    // When online_payments and booking_appointments are selected, their follow-up questions become visible
    const paymentAndBookingResponses = {
      selected_features: ["online_payments", "booking_appointments"],
    };
    expect(
      isQuestionVisible(paymentPurposeQuestion, paymentAndBookingResponses)
    ).toBe(true);
    expect(
      isQuestionVisible(bookingQuestion, paymentAndBookingResponses)
    ).toBe(true);
    expect(
      isQuestionVisible(ecommerceQuestion, paymentAndBookingResponses)
    ).toBe(false);
  });

  it("excludes hidden conditional questions from required completion and includes them when triggered", () => {
    const template = getTemplateBlueprintByCategory("CORPORATE");

    const withoutPayments = calculateQuestionnaireCompletion(
      template.sections,
      {
        selected_features: ["contact_forms"],
      }
    );

    const withPayments = calculateQuestionnaireCompletion(template.sections, {
      selected_features: ["contact_forms", "online_payments"],
    });

    // Selecting online_payments reveals 3 required follow-up questions
    expect(withPayments.totalRequiredQuestions).toBe(
      withoutPayments.totalRequiredQuestions + 3
    );
  });

  it("persists incremental autosaves, transitions status to IN_PROGRESS, locks upon final submission, and handles clarification cycles", () => {
    const client = createClientRecord(TEST_WORKSPACE, {
      organisationName: "Zeta Medics",
      contactName: "Dr. Kola",
      contactEmail: "kola@zetamedics.com",
    });

    const { project, rawInvitationToken } = createProjectWithSession({
      workspaceId: TEST_WORKSPACE,
      actorId: "00000000-0000-4000-8000-000000000001",
      actorLabel: "Admin",
      clientId: client.id,
      projectName: "Zeta Medics Website",
      websiteCategory: "CORPORATE",
    });

    expect(project.status).toBe("INVITATION_SENT");

    // 1. Autosave Section 1 & Section 2
    const save1 = saveQuestionnaireAnswersByToken({
      rawToken: rawInvitationToken,
      sectionKey: "client_business_info",
      answers: {
        organisation_name: "Zeta Medics",
        business_description: "Specialist diagnostic clinic and telemedicine provider.",
        industry: "Healthcare",
        organisation_type: "private_company",
        physical_address: "12 Admiralty Way, Lekki",
        operating_locations: "Lagos",
        primary_contact_name: "Dr. Kola",
        contact_email: "kola@zetamedics.com",
        phone_number: "+234800000000",
      },
    });

    expect(save1.projectStatus).toBe("IN_PROGRESS");
    expect(save1.completion.overallPercentage).toBeGreaterThan(20);

    // 2. Attempting to submit before all required fields are answered must throw
    expect(() =>
      submitQuestionnaireByToken({
        rawToken: rawInvitationToken,
        confirmedAccurate: true,
      })
    ).toThrow(/complete all required questions/i);

    // 3. Complete remaining required fields across sections 2–11
    saveQuestionnaireAnswersByToken({
      rawToken: rawInvitationToken,
      sectionKey: "all_remaining",
      answers: {
        new_or_redesign: "new_website",
        primary_objectives: ["establish_presence", "generate_leads"],
        why_need_website: "Allow patients to book diagnostic scans online.",
        visitor_accomplishments: "View test prices and book an appointment.",
        success_criteria: "100+ online bookings per month.",
        primary_audience: "Patients and referring doctors in Lagos.",
        geographical_locations: "Lagos, Nigeria",
        languages: "English",
        typical_visitor_problems: "Long wait times and unclear test preparation rules.",
        desired_visitor_actions: "Book a Diagnostic Scan",
        selected_pages: ["home", "about_us", "services", "contact"],
        content_responsibility: "hybrid",
        logo_availability: "yes_vector",
        preferred_design_style: ["modern", "professional"],
        existing_photography: "mix_custom_stock",
        selected_features: ["contact_forms"],
        existing_domain: "zetamedics.com",
        existing_hosting_provider: "Need agency recommendation",
        existing_business_email: "Google Workspace",
        website_manager: "shared",
        publishing_responsibilities: "Clinic manager posts health articles.",
        number_of_administrators_and_roles: "2 administrators",
        training_requirements: "live_session_and_guide",
        budget_range: "1500_to_3500_usd",
        preferred_launch_date: "2026-12-31",
        project_urgency: "standard",
        privacy_policy_availability: "need_standard_template",
        terms_and_conditions_availability: "need_standard_template",
        corporate_business_services: "MRI, CT Scan, Ultrasound, Blood Diagnostics",
        corporate_enquiries_and_leads: "Email alerts to bookings@zetamedics.com",
      },
    });

    // 4. Submit without confirmation checkbox must fail
    expect(() =>
      submitQuestionnaireByToken({
        rawToken: rawInvitationToken,
        confirmedAccurate: false,
      })
    ).toThrow(/explicitly confirm/i);

    // 5. Submit with confirmation succeeds and locks ordinary editing
    const submitted = submitQuestionnaireByToken({
      rawToken: rawInvitationToken,
      confirmedAccurate: true,
    });
    expect(submitted.projectStatus).toBe("SUBMITTED");
    expect(submitted.completion.overallPercentage).toBe(100);

    // 6. Attempting to autosave after submission is blocked (locked)
    expect(() =>
      saveQuestionnaireAnswersByToken({
        rawToken: rawInvitationToken,
        sectionKey: "client_business_info",
        answers: { organisation_name: "Tampered Name" },
      })
    ).toThrow(/SUBMITTED_LOCKED/i);

    // 7. Agency requests clarification -> unlocks session for client response
    const clarification = createClarificationRequestRecord({
      workspaceId: TEST_WORKSPACE,
      projectId: project.id,
      actorId: "00000000-0000-4000-8000-000000000001",
      actorLabel: "Admin",
      sectionKey: "technical_infrastructure",
      questionKey: "existing_domain",
      message: "Please confirm who manages the Cloudflare DNS account.",
    });

    const unlockedSession = getPortalSessionByToken(rawInvitationToken);
    expect(unlockedSession?.project.status).toBe("AWAITING_CLIENT_RESPONSE");
    expect(unlockedSession?.tokenState.canEdit).toBe(true);
    expect(unlockedSession?.tokenState.canRespondToClarification).toBe(true);

    // 8. Client answers clarification -> status returns to SUBMITTED
    const answered = respondToClarificationByToken({
      rawToken: rawInvitationToken,
      clarificationId: clarification.id,
      responseText: "Our IT consultant manages Cloudflare DNS and is ready.",
    });
    expect(answered.status).toBe("ANSWERED");

    const relockedSession = getPortalSessionByToken(rawInvitationToken);
    expect(relockedSession?.project.status).toBe("SUBMITTED");
  });
});

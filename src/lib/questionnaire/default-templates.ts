import type {
  ConditionalRulesJson,
  QuestionInputType,
  QuestionOptionItem,
  ValidationRulesJson,
  WebsiteCategory,
} from "@/db/schema";

export interface QuestionBlueprint {
  id: string;
  questionKey: string;
  label: string;
  description?: string;
  inputType: QuestionInputType;
  options?: QuestionOptionItem[];
  validationRules?: ValidationRulesJson;
  conditionalRules?: ConditionalRulesJson | null;
  sortOrder: number;
  isRequired: boolean;
}

export interface SectionBlueprint {
  id: string;
  sectionKey: string;
  title: string;
  description: string;
  sortOrder: number;
  isRequired: boolean;
  questions: QuestionBlueprint[];
}

export interface TemplateBlueprint {
  id: string;
  name: string;
  websiteCategory: WebsiteCategory;
  description: string;
  isActive: boolean;
  version: number;
  sections: SectionBlueprint[];
}

// -----------------------------------------------------------------------------
// Reusable Core Discovery Sections (Sections 1–10 + Category Specific + Review)
// -----------------------------------------------------------------------------

const SECTION_1_BUSINESS_INFO: SectionBlueprint = {
  id: "sec-01-business-info",
  sectionKey: "client_business_info",
  title: "1. Client & Business Information",
  description:
    "Tell us about your organisation, registration details, operating locations, and primary points of contact.",
  sortOrder: 1,
  isRequired: true,
  questions: [
    {
      id: "q-org-name",
      questionKey: "organisation_name",
      label: "Organisation / Brand Name",
      description: "The trading or public name that will appear on the website.",
      inputType: "TEXT",
      validationRules: {
        placeholder: "e.g. Zenith Logistics Ltd",
        minLength: 2,
      },
      sortOrder: 1,
      isRequired: true,
    },
    {
      id: "q-reg-name",
      questionKey: "business_registration_name",
      label: "Registered Legal Entity Name (if different)",
      description: "Used for footer copyright, privacy policy, and legal notices.",
      inputType: "TEXT",
      validationRules: { placeholder: "e.g. Zenith Integrated Logistics RC-102938" },
      sortOrder: 2,
      isRequired: false,
    },
    {
      id: "q-biz-desc",
      questionKey: "business_description",
      label: "Business Description & Core Value Proposition",
      description: "Describe what your organisation does, its mission, and what sets it apart.",
      inputType: "TEXTAREA",
      validationRules: {
        placeholder: "Summarise your products, services, and competitive advantage...",
        minLength: 10,
      },
      sortOrder: 3,
      isRequired: true,
    },
    {
      id: "q-industry",
      questionKey: "industry",
      label: "Industry / Sector",
      inputType: "TEXT",
      validationRules: { placeholder: "e.g. Financial Services, Healthcare, Education, Retail" },
      sortOrder: 4,
      isRequired: true,
    },
    {
      id: "q-org-type",
      questionKey: "organisation_type",
      label: "Organisation Type",
      inputType: "SELECT",
      options: [
        { value: "private_company", label: "Private Limited Company" },
        { value: "public_company", label: "Public Enterprise / PLC" },
        { value: "sme_startup", label: "Startup / SME" },
        { value: "educational", label: "Educational Institution" },
        { value: "ngo_nonprofit", label: "NGO / Non-Profit / Foundation" },
        { value: "government", label: "Government Agency" },
        { value: "individual", label: "Personal / Sole Proprietor" },
      ],
      sortOrder: 5,
      isRequired: true,
    },
    {
      id: "q-year-established",
      questionKey: "year_established",
      label: "Year Established",
      inputType: "NUMBER",
      validationRules: { placeholder: "e.g. 2018", min: 1800, max: 2100 },
      sortOrder: 6,
      isRequired: false,
    },
    {
      id: "q-physical-address",
      questionKey: "physical_address",
      label: "Headquarters / Physical Address",
      inputType: "TEXTAREA",
      validationRules: { placeholder: "Street address, city, state, country" },
      sortOrder: 7,
      isRequired: true,
    },
    {
      id: "q-operating-locations",
      questionKey: "operating_locations",
      label: "Operating Locations / Service Coverage",
      description: "Where do you serve customers or operate branches?",
      inputType: "TEXT",
      validationRules: { placeholder: "e.g. Lagos, Abuja, Nationwide, Global" },
      sortOrder: 8,
      isRequired: true,
    },
    {
      id: "q-primary-contact",
      questionKey: "primary_contact_name",
      label: "Primary Project Contact Name & Title",
      inputType: "TEXT",
      validationRules: { placeholder: "e.g. Chidi Nwosu — Head of Operations" },
      sortOrder: 9,
      isRequired: true,
    },
    {
      id: "q-contact-email",
      questionKey: "contact_email",
      label: "Primary Contact Email",
      inputType: "EMAIL",
      validationRules: { placeholder: "name@company.com" },
      sortOrder: 10,
      isRequired: true,
    },
    {
      id: "q-contact-phone",
      questionKey: "phone_number",
      label: "Phone Number",
      inputType: "TEXT",
      validationRules: { placeholder: "+234 800 000 0000" },
      sortOrder: 11,
      isRequired: true,
    },
    {
      id: "q-whatsapp",
      questionKey: "whatsapp_number",
      label: "WhatsApp Number (for quick project updates or site widget)",
      inputType: "TEXT",
      validationRules: { placeholder: "+234 800 000 0000" },
      sortOrder: 12,
      isRequired: false,
    },
    {
      id: "q-existing-website",
      questionKey: "existing_website",
      label: "Existing Website URL (if any)",
      inputType: "URL",
      validationRules: { placeholder: "https://www.example.com" },
      sortOrder: 13,
      isRequired: false,
    },
    {
      id: "q-social-links",
      questionKey: "social_media_links",
      label: "Active Social Media Profiles",
      description: "Paste links to LinkedIn, Instagram, X/Twitter, Facebook, YouTube, etc.",
      inputType: "TEXTAREA",
      validationRules: { placeholder: "LinkedIn: https://...\nInstagram: https://..." },
      sortOrder: 14,
      isRequired: false,
    },
  ],
};

const SECTION_2_OBJECTIVES: SectionBlueprint = {
  id: "sec-02-objectives",
  sectionKey: "project_objectives",
  title: "2. Project Objectives",
  description:
    "Define why this website is needed, the business challenges it solves, and how we will measure success.",
  sortOrder: 2,
  isRequired: true,
  questions: [
    {
      id: "q-new-or-redesign",
      questionKey: "new_or_redesign",
      label: "Is this a brand-new website or a redesign of an existing platform?",
      inputType: "RADIO",
      options: [
        { value: "new_website", label: "Brand-new website" },
        { value: "redesign", label: "Redesign / rebuild of an existing website" },
        { value: "expansion", label: "Feature expansion / portal addition" },
      ],
      sortOrder: 1,
      isRequired: true,
    },
    {
      id: "q-primary-objectives",
      questionKey: "primary_objectives",
      label: "What are your primary objectives for this website? (Select all that apply)",
      inputType: "MULTI_SELECT",
      options: [
        { value: "establish_presence", label: "Establish professional online presence" },
        { value: "generate_leads", label: "Generate qualified sales leads & enquiries" },
        { value: "sell_products", label: "Sell physical or digital products online" },
        { value: "promote_services", label: "Promote and explain services" },
        { value: "publish_information", label: "Publish news, research, or public information" },
        { value: "accept_payments", label: "Accept online payments or fees" },
        { value: "manage_customers", label: "Manage customers & client accounts" },
        { value: "manage_students_members", label: "Manage students, alumni, or members" },
        { value: "automate_processes", label: "Automate internal business workflows" },
        { value: "other", label: "Other objective" },
      ],
      sortOrder: 2,
      isRequired: true,
    },
    {
      id: "q-why-need-website",
      questionKey: "why_need_website",
      label: "Why do you need this website right now, and what business problem should it solve?",
      inputType: "TEXTAREA",
      validationRules: {
        placeholder: "Explain the current bottleneck or opportunity...",
        minLength: 10,
      },
      sortOrder: 3,
      isRequired: true,
    },
    {
      id: "q-visitor-accomplish",
      questionKey: "visitor_accomplishments",
      label: "What should visitors be able to accomplish within 60 seconds of landing on the site?",
      inputType: "TEXTAREA",
      validationRules: {
        placeholder: "e.g. Understand our services, request a quote, book a consultation...",
      },
      sortOrder: 4,
      isRequired: true,
    },
    {
      id: "q-success-criteria",
      questionKey: "success_criteria",
      label: "What would make this project a clear success 6 months after launch?",
      inputType: "TEXTAREA",
      validationRules: {
        placeholder: "e.g. 50+ monthly inbound leads, 80% reduction in manual phone enquiries...",
      },
      sortOrder: 5,
      isRequired: true,
    },
    {
      id: "q-major-expectations",
      questionKey: "major_expectations",
      label: "Additional Explanation & Major Expectations",
      inputType: "TEXTAREA",
      validationRules: {
        placeholder: "Any specific performance, speed, or stakeholder expectations...",
      },
      sortOrder: 6,
      isRequired: false,
    },
  ],
};

const SECTION_3_TARGET_AUDIENCE: SectionBlueprint = {
  id: "sec-03-target-audience",
  sectionKey: "target_audience",
  title: "3. Target Audience",
  description:
    "Help us understand who will visit the website, what they care about, and how to guide them to action.",
  sortOrder: 3,
  isRequired: true,
  questions: [
    {
      id: "q-primary-audience",
      questionKey: "primary_audience",
      label: "Primary Target Audience",
      description: "Who is your #1 ideal visitor or buyer persona?",
      inputType: "TEXTAREA",
      validationRules: {
        placeholder: "e.g. Corporate procurement managers, parents of prospective students, retail shoppers...",
      },
      sortOrder: 1,
      isRequired: true,
    },
    {
      id: "q-secondary-audience",
      questionKey: "secondary_audience",
      label: "Secondary Audience (Partners, Investors, Regulators, Job Seekers, etc.)",
      inputType: "TEXTAREA",
      validationRules: { placeholder: "Describe secondary visitor groups..." },
      sortOrder: 2,
      isRequired: false,
    },
    {
      id: "q-age-groups",
      questionKey: "age_groups",
      label: "Typical Age Groups",
      inputType: "MULTI_SELECT",
      options: [
        { value: "under_18", label: "Under 18 (Students / Youth)" },
        { value: "18_24", label: "18 – 24 (Young Adults / University)" },
        { value: "25_44", label: "25 – 44 (Working Professionals)" },
        { value: "45_64", label: "45 – 64 (Senior Decision Makers / Executives)" },
        { value: "65_plus", label: "65+ (Seniors / Retirees)" },
      ],
      sortOrder: 3,
      isRequired: false,
    },
    {
      id: "q-audience-geography",
      questionKey: "geographical_locations",
      label: "Target Geographical Locations",
      inputType: "TEXT",
      validationRules: { placeholder: "e.g. Nigeria, West Africa, UK & Diaspora, Worldwide" },
      sortOrder: 4,
      isRequired: true,
    },
    {
      id: "q-languages",
      questionKey: "languages",
      label: "Required Website Languages",
      inputType: "TEXT",
      validationRules: { placeholder: "e.g. English (Primary), French" },
      sortOrder: 5,
      isRequired: true,
    },
    {
      id: "q-visitor-problems",
      questionKey: "typical_visitor_problems",
      label: "What typical questions, doubts, or problems do your visitors have before contacting you?",
      inputType: "TEXTAREA",
      validationRules: { placeholder: "e.g. Pricing transparency, turnaround times, credibility..." },
      sortOrder: 6,
      isRequired: true,
    },
    {
      id: "q-desired-visitor-actions",
      questionKey: "desired_visitor_actions",
      label: "Desired Primary Call-to-Action (CTA)",
      description: "What single action should the main button in the header trigger?",
      inputType: "TEXT",
      validationRules: { placeholder: "e.g. Request a Proposal, Book an Appointment, Shop Now, Apply Online" },
      sortOrder: 7,
      isRequired: true,
    },
  ],
};

const SECTION_4_STRUCTURE_CONTENT: SectionBlueprint = {
  id: "sec-04-structure-content",
  sectionKey: "website_structure_content",
  title: "4. Website Structure & Content",
  description:
    "Select your expected pages, define custom pages with specific requirements, and clarify content readiness.",
  sortOrder: 4,
  isRequired: true,
  questions: [
    {
      id: "q-selected-pages",
      questionKey: "selected_pages",
      label: "Select Standard Pages Required for Your Website",
      inputType: "MULTI_SELECT",
      options: [
        { value: "home", label: "Home" },
        { value: "about_us", label: "About Us" },
        { value: "services", label: "Services" },
        { value: "products", label: "Products" },
        { value: "our_team", label: "Our Team / Leadership" },
        { value: "projects", label: "Projects" },
        { value: "portfolio", label: "Portfolio / Case Studies" },
        { value: "news", label: "News & Press Releases" },
        { value: "blog", label: "Blog / Insights" },
        { value: "gallery", label: "Photo / Media Gallery" },
        { value: "testimonials", label: "Client Testimonials" },
        { value: "faq", label: "Frequently Asked Questions (FAQ)" },
        { value: "contact", label: "Contact Us" },
        { value: "careers", label: "Careers / Job Openings" },
        { value: "downloads", label: "Downloads / Resources" },
        { value: "custom_pages", label: "Custom Pages (Specify below)" },
      ],
      sortOrder: 1,
      isRequired: true,
    },
    {
      id: "q-page-details-builder",
      questionKey: "page_specifications",
      label: "Page-by-Page Breakdown & Custom Pages",
      description:
        "Add details for key selected pages or define custom pages (Page Name, Purpose, Content Availability, Special Requirements).",
      inputType: "PAGE_BUILDER",
      sortOrder: 2,
      isRequired: false,
    },
    {
      id: "q-content-responsibility",
      questionKey: "content_responsibility",
      label: "Who will provide the written text and copywriting for the website?",
      inputType: "RADIO",
      options: [
        { value: "client_ready", label: "We have all written content ready to supply" },
        { value: "client_drafting", label: "We are drafting the content and will supply it by an agreed date" },
        { value: "hybrid", label: "We have rough notes/profiles and need the agency to polish & structure them" },
        { value: "agency_copywriting", label: "We require full professional copywriting assistance from the agency" },
      ],
      sortOrder: 3,
      isRequired: true,
    },
  ],
};

const SECTION_5_DESIGN_BRANDING: SectionBlueprint = {
  id: "sec-05-design-branding",
  sectionKey: "design_branding",
  title: "5. Design & Branding",
  description:
    "Share your visual identity, colour palette, design style preferences, and reference websites.",
  sortOrder: 5,
  isRequired: true,
  questions: [
    {
      id: "q-logo-availability",
      questionKey: "logo_availability",
      label: "Do you have a high-resolution logo ready?",
      inputType: "RADIO",
      options: [
        { value: "yes_vector", label: "Yes — we have vector/high-res files (SVG, PNG, AI, PDF)" },
        { value: "yes_low_res", label: "We have a logo, but only in low resolution / JPEG" },
        { value: "need_redesign", label: "We need our existing logo refreshed" },
        { value: "need_new_logo", label: "We do not have a logo and need brand design" },
      ],
      sortOrder: 1,
      isRequired: true,
    },
    {
      id: "q-primary-colour",
      questionKey: "primary_brand_colour",
      label: "Primary Brand Colour (Hex code or description)",
      inputType: "TEXT",
      validationRules: { placeholder: "e.g. #202D3B or Deep Navy Blue" },
      sortOrder: 2,
      isRequired: false,
    },
    {
      id: "q-secondary-colour",
      questionKey: "secondary_brand_colour",
      label: "Secondary / Accent Brand Colour",
      inputType: "TEXT",
      validationRules: { placeholder: "e.g. #A2D514 or Lime Green / Gold" },
      sortOrder: 3,
      isRequired: false,
    },
    {
      id: "q-brand-guidelines",
      questionKey: "existing_brand_guidelines",
      label: "Brand Guidelines & Typography",
      description: "Do you have a brand manual or preferred fonts? Upload brand assets in the Supporting Files panel below.",
      inputType: "TEXTAREA",
      validationRules: { placeholder: "Preferred fonts (e.g. Inter, Plus Jakarta Sans) and brand usage rules..." },
      sortOrder: 4,
      isRequired: false,
    },
    {
      id: "q-design-style",
      questionKey: "preferred_design_style",
      label: "Preferred Visual Design Style (Select up to 3)",
      inputType: "MULTI_SELECT",
      options: [
        { value: "corporate", label: "Corporate & Authoritative" },
        { value: "minimalist", label: "Minimalist & Clean" },
        { value: "modern", label: "Modern SaaS / Tech-Forward" },
        { value: "creative", label: "Creative & Bold" },
        { value: "luxury", label: "Luxury & High-End" },
        { value: "professional", label: "Warm & Professional" },
        { value: "youthful", label: "Youthful & Energetic" },
        { value: "traditional", label: "Traditional & Institutional" },
        { value: "other", label: "Other" },
      ],
      sortOrder: 5,
      isRequired: true,
    },
    {
      id: "q-existing-photography",
      questionKey: "existing_photography",
      label: "Photography & Visual Assets Availability",
      inputType: "RADIO",
      options: [
        { value: "custom_photos_ready", label: "We have original photos of our team, office, or products" },
        { value: "mix_custom_stock", label: "We have some photos and want curated stock imagery for the rest" },
        { value: "stock_only", label: "Please use curated professional stock imagery and illustrations" },
      ],
      sortOrder: 6,
      isRequired: true,
    },
    {
      id: "q-reference-websites",
      questionKey: "reference_websites",
      label: "Reference Websites You Admire (URLs & what you like about them)",
      inputType: "TEXTAREA",
      validationRules: {
        placeholder: "1. https://stripe.com — Clean typography and clear layout\n2. https://...",
      },
      sortOrder: 7,
      isRequired: false,
    },
    {
      id: "q-competitor-websites",
      questionKey: "competitor_websites",
      label: "Competitor Websites (URLs)",
      inputType: "TEXTAREA",
      validationRules: { placeholder: "List 2–3 competitors in your space..." },
      sortOrder: 8,
      isRequired: false,
    },
    {
      id: "q-design-dislikes",
      questionKey: "design_dislikes",
      label: "Things You Dislike or Want to Avoid in the Design",
      inputType: "TEXTAREA",
      validationRules: { placeholder: "e.g. Cluttered popups, slow carousels, dark backgrounds..." },
      sortOrder: 9,
      isRequired: false,
    },
  ],
};

const SECTION_6_FUNCTIONAL_REQUIREMENTS: SectionBlueprint = {
  id: "sec-06-functional-requirements",
  sectionKey: "functional_requirements",
  title: "6. Functional Requirements & Conditional Features",
  description:
    "Select the interactive features your website needs. Selecting key capabilities will automatically reveal targeted follow-up questions.",
  sortOrder: 6,
  isRequired: true,
  questions: [
    {
      id: "q-selected-features",
      questionKey: "selected_features",
      label: "Select Required Website Features & Capabilities",
      inputType: "MULTI_SELECT",
      options: [
        { value: "contact_forms", label: "Contact & Lead Capture Forms" },
        { value: "user_registration", label: "User Registration & Accounts" },
        { value: "user_login", label: "Member / Customer Login Portal" },
        { value: "admin_dashboard", label: "Administrative Dashboard" },
        { value: "content_management", label: "Content Management System (CMS)" },
        { value: "online_payments", label: "Online Payments" },
        { value: "shopping_cart", label: "Shopping Cart & E-Commerce" },
        { value: "product_management", label: "Product Catalogue Management" },
        { value: "booking_appointments", label: "Booking & Appointments" },
        { value: "search", label: "Site-Wide Search & Filtering" },
        { value: "live_chat", label: "Live Chat / WhatsApp Chat Widget" },
        { value: "email_notifications", label: "Automated Email Notifications" },
        { value: "sms_notifications", label: "SMS Notifications" },
        { value: "document_downloads", label: "Document Downloads & Resource Library" },
        { value: "membership_management", label: "Membership / Subscription Management" },
        { value: "customer_management", label: "Customer / CRM Management" },
        { value: "reporting", label: "Custom Reporting & Exports" },
        { value: "analytics", label: "Traffic & Conversion Analytics" },
        { value: "multiple_user_roles", label: "Multiple User Roles & Permissions" },
        { value: "approval_workflows", label: "Multi-Step Approval Workflows" },
        { value: "third_party_integrations", label: "Third-Party Software Integrations" },
        { value: "api_connectivity", label: "Custom API Connectivity" },
        { value: "other", label: "Other Custom Feature" },
      ],
      sortOrder: 1,
      isRequired: true,
    },

    // --- CONDITIONAL GROUP A: ONLINE PAYMENTS ---
    {
      id: "q-pay-what-for",
      questionKey: "payment_purpose",
      label: "[Online Payments] What will customers or users pay for?",
      inputType: "TEXT",
      validationRules: { placeholder: "e.g. Products, service retainers, school fees, event tickets, donations" },
      conditionalRules: {
        operator: "OR",
        conditions: [
          { questionKey: "selected_features", comparator: "INCLUDES", value: "online_payments" },
        ],
      },
      sortOrder: 2,
      isRequired: true,
    },
    {
      id: "q-pay-currencies",
      questionKey: "payment_currencies",
      label: "[Online Payments] Which currencies are required?",
      inputType: "TEXT",
      validationRules: { placeholder: "e.g. NGN, USD, GBP, EUR" },
      conditionalRules: {
        operator: "OR",
        conditions: [
          { questionKey: "selected_features", comparator: "INCLUDES", value: "online_payments" },
        ],
      },
      sortOrder: 3,
      isRequired: true,
    },
    {
      id: "q-pay-gateways",
      questionKey: "payment_methods_preferred",
      label: "[Online Payments] Which payment gateways or methods are preferred?",
      inputType: "TEXT",
      validationRules: { placeholder: "e.g. Paystack, Flutterwave, Stripe, Bank Transfer, Card, USSD" },
      conditionalRules: {
        operator: "OR",
        conditions: [
          { questionKey: "selected_features", comparator: "INCLUDES", value: "online_payments" },
        ],
      },
      sortOrder: 4,
      isRequired: true,
    },
    {
      id: "q-pay-receipts-refunds",
      questionKey: "payment_confirmation_and_refunds",
      label: "[Online Payments] Are automatic payment receipts/confirmations and refund handling required?",
      inputType: "TEXTAREA",
      validationRules: { placeholder: "Describe receipt generation, webhook confirmation, and refund rules..." },
      conditionalRules: {
        operator: "OR",
        conditions: [
          { questionKey: "selected_features", comparator: "INCLUDES", value: "online_payments" },
        ],
      },
      sortOrder: 5,
      isRequired: false,
    },

    // --- CONDITIONAL GROUP B: BOOKING & APPOINTMENTS ---
    {
      id: "q-booking-availability",
      questionKey: "booking_availability_manager",
      label: "[Booking] Who manages calendar availability and appointment types?",
      inputType: "TEXTAREA",
      validationRules: { placeholder: "Explain appointment types, staff schedules, and rescheduling rules..." },
      conditionalRules: {
        operator: "OR",
        conditions: [
          { questionKey: "selected_features", comparator: "INCLUDES", value: "booking_appointments" },
        ],
      },
      sortOrder: 6,
      isRequired: true,
    },
    {
      id: "q-booking-rules",
      questionKey: "booking_reschedule_and_payment",
      label: "[Booking] Can users reschedule online, are upfront deposits required, and should automated reminders be sent?",
      inputType: "TEXTAREA",
      validationRules: { placeholder: "Yes/No for rescheduling, deposit rules, email/SMS confirmations..." },
      conditionalRules: {
        operator: "OR",
        conditions: [
          { questionKey: "selected_features", comparator: "INCLUDES", value: "booking_appointments" },
        ],
      },
      sortOrder: 7,
      isRequired: true,
    },

    // --- CONDITIONAL GROUP C: USER ACCOUNTS & REGISTRATION ---
    {
      id: "q-accounts-policy",
      questionKey: "user_accounts_registration_policy",
      label: "[User Accounts] Who can register, and is registration open to the public or invitation/approval-only?",
      inputType: "TEXTAREA",
      validationRules: { placeholder: "e.g. Open self-registration vs Admin-approved onboarding..." },
      conditionalRules: {
        operator: "OR",
        conditions: [
          { questionKey: "selected_features", comparator: "INCLUDES", value: "user_registration" },
          { questionKey: "selected_features", comparator: "INCLUDES", value: "user_login" },
        ],
      },
      sortOrder: 8,
      isRequired: true,
    },
    {
      id: "q-accounts-fields-roles",
      questionKey: "user_accounts_data_and_roles",
      label: "[User Accounts] What profile information is collected and what access levels are required?",
      inputType: "TEXTAREA",
      validationRules: { placeholder: "List required user profile fields and role permissions..." },
      conditionalRules: {
        operator: "OR",
        conditions: [
          { questionKey: "selected_features", comparator: "INCLUDES", value: "user_registration" },
          { questionKey: "selected_features", comparator: "INCLUDES", value: "user_login" },
          { questionKey: "selected_features", comparator: "INCLUDES", value: "multiple_user_roles" },
        ],
      },
      sortOrder: 9,
      isRequired: true,
    },

    // --- CONDITIONAL GROUP D: E-COMMERCE & SHOPPING CART ---
    {
      id: "q-ecom-catalogue-scale",
      questionKey: "ecommerce_catalogue_details",
      label: "[E-Commerce] How many product categories and initial products do you have, and is inventory tracking needed?",
      inputType: "TEXTAREA",
      validationRules: { placeholder: "e.g. 8 categories, ~150 SKUs, real-time stock tracking..." },
      conditionalRules: {
        operator: "OR",
        conditions: [
          { questionKey: "selected_features", comparator: "INCLUDES", value: "shopping_cart" },
          { questionKey: "selected_features", comparator: "INCLUDES", value: "product_management" },
        ],
      },
      sortOrder: 10,
      isRequired: true,
    },
    {
      id: "q-ecom-shipping-discounts",
      questionKey: "ecommerce_shipping_and_orders",
      label: "[E-Commerce] Are regional delivery fees, order status tracking, and discount codes needed?",
      inputType: "TEXTAREA",
      validationRules: { placeholder: "Describe delivery fee calculation, order tracking, and promo codes..." },
      conditionalRules: {
        operator: "OR",
        conditions: [
          { questionKey: "selected_features", comparator: "INCLUDES", value: "shopping_cart" },
          { questionKey: "selected_features", comparator: "INCLUDES", value: "product_management" },
        ],
      },
      sortOrder: 11,
      isRequired: true,
    },

    {
      id: "q-functional-notes",
      questionKey: "additional_functional_notes",
      label: "Additional Functional or Workflow Details",
      inputType: "TEXTAREA",
      validationRules: { placeholder: "Describe any custom calculators, workflows, or special features..." },
      sortOrder: 12,
      isRequired: false,
    },
  ],
};

const SECTION_7_TECHNICAL_INFRASTRUCTURE: SectionBlueprint = {
  id: "sec-07-technical-infrastructure",
  sectionKey: "technical_infrastructure",
  title: "7. Technical & Infrastructure Requirements",
  description:
    "Share details about your domain, hosting, email setup, integrations, and expected traffic. Never submit passwords or secret keys through this form.",
  sortOrder: 7,
  isRequired: true,
  questions: [
    {
      id: "q-existing-domain",
      questionKey: "existing_domain",
      label: "Do you already own the domain name? If yes, specify the domain and registrar.",
      inputType: "TEXT",
      validationRules: { placeholder: "e.g. Yes — example.com registered on Cloudflare / Namecheap / GoDaddy" },
      sortOrder: 1,
      isRequired: true,
    },
    {
      id: "q-hosting-provider",
      questionKey: "existing_hosting_provider",
      label: "Existing Hosting Provider & Access Availability",
      description: "Do not enter passwords here. Simply state who manages your current hosting or DNS.",
      inputType: "TEXT",
      validationRules: { placeholder: "e.g. Vercel / AWS / cPanel managed by internal IT, or Need agency recommendation" },
      sortOrder: 2,
      isRequired: true,
    },
    {
      id: "q-code-database",
      questionKey: "existing_code_and_database",
      label: "Is there existing source code or an existing database that must be migrated?",
      inputType: "TEXTAREA",
      validationRules: { placeholder: "e.g. Existing WordPress database to migrate, or Starting fresh" },
      sortOrder: 3,
      isRequired: false,
    },
    {
      id: "q-business-email",
      questionKey: "existing_business_email",
      label: "Business Email Setup (Google Workspace, Microsoft 365, Zoho, or needed?)",
      inputType: "TEXT",
      validationRules: { placeholder: "e.g. Using Google Workspace, or Need 10 @company.com email accounts set up" },
      sortOrder: 4,
      isRequired: true,
    },
    {
      id: "q-third-party-integrations",
      questionKey: "required_integrations",
      label: "Required Third-Party Integrations (CRM, ERP, Accounting, Mailchimp, Analytics, etc.)",
      inputType: "TEXTAREA",
      validationRules: { placeholder: "e.g. HubSpot CRM, Paystack, Google Analytics 4, Mailchimp, WhatsApp Business" },
      sortOrder: 5,
      isRequired: false,
    },
    {
      id: "q-traffic-scale",
      questionKey: "expected_traffic_and_users",
      label: "Expected Monthly Traffic, Concurrent Users & Data Storage Volume",
      inputType: "TEXT",
      validationRules: { placeholder: "e.g. ~5,000 monthly visitors, 500 registered users, ~10GB media storage" },
      sortOrder: 6,
      isRequired: false,
    },
    {
      id: "q-backups-maintenance",
      questionKey: "backup_and_maintenance_expectations",
      label: "Backup, Uptime & Ongoing Technical Maintenance Expectations",
      inputType: "TEXTAREA",
      validationRules: { placeholder: "e.g. Daily automated backups, SSL monitoring, monthly security updates..." },
      sortOrder: 7,
      isRequired: false,
    },
  ],
};

const SECTION_8_CONTENT_MANAGEMENT: SectionBlueprint = {
  id: "sec-08-content-management",
  sectionKey: "content_management",
  title: "8. Content Management & Administration",
  description:
    "Clarify who will manage day-to-day updates, announcements, enquiries, and administrative roles after launch.",
  sortOrder: 8,
  isRequired: true,
  questions: [
    {
      id: "q-who-manages-site",
      questionKey: "website_manager",
      label: "Who will manage the website after launch?",
      inputType: "RADIO",
      options: [
        { value: "internal_team", label: "Our internal staff / communications team" },
        { value: "agency_retainer", label: "We want the agency to manage updates under a support retainer" },
        { value: "shared", label: "Shared — internal team handles basic posts, agency handles technical updates" },
      ],
      sortOrder: 1,
      isRequired: true,
    },
    {
      id: "q-publishing-responsibilities",
      questionKey: "publishing_responsibilities",
      label: "Who will publish announcements, update services, upload photos, and respond to customer enquiries?",
      inputType: "TEXTAREA",
      validationRules: { placeholder: "Describe how your team will handle announcements, photos, and inbound leads..." },
      sortOrder: 2,
      isRequired: true,
    },
    {
      id: "q-admin-count-roles",
      questionKey: "number_of_administrators_and_roles",
      label: "How many administrators are needed, and what administrative roles are required?",
      inputType: "TEXT",
      validationRules: { placeholder: "e.g. 3 admins (1 Super Admin, 1 Content Editor, 1 Customer Support)" },
      sortOrder: 3,
      isRequired: true,
    },
    {
      id: "q-training-requirements",
      questionKey: "training_requirements",
      label: "Do your staff require handover training or video documentation?",
      inputType: "RADIO",
      options: [
        { value: "live_session_and_guide", label: "Yes — live walkthrough session plus written/video guide" },
        { value: "documentation_only", label: "Written/recorded user guide is sufficient" },
        { value: "not_required", label: "Not required (Agency will manage updates)" },
      ],
      sortOrder: 4,
      isRequired: true,
    },
  ],
};

const SECTION_9_BUDGET_TIMELINE: SectionBlueprint = {
  id: "sec-09-budget-timeline",
  sectionKey: "budget_timeline",
  title: "9. Budget & Timeline",
  description:
    "Align on estimated investment range, target launch dates, milestone payment structure, and post-launch support.",
  sortOrder: 9,
  isRequired: true,
  questions: [
    {
      id: "q-budget-range",
      questionKey: "budget_range",
      label: "Estimated Project Budget Range",
      inputType: "SELECT",
      options: [
        { value: "under_1500_usd", label: "Starter Tier (Under $1,500 / ₦1.5M)" },
        { value: "1500_to_3500_usd", label: "Growth Tier ($1,500 – $3,500 / ₦1.5M – ₦4M)" },
        { value: "3500_to_7500_usd", label: "Business / Portal Tier ($3,500 – $7,500 / ₦4M – ₦9M)" },
        { value: "above_7500_usd", label: "Enterprise / Custom Platform ($7,500+ / ₦9M+)" },
        { value: "need_proposal", label: "Open — Please recommend options based on our requirements" },
      ],
      sortOrder: 1,
      isRequired: true,
    },
    {
      id: "q-preferred-launch-date",
      questionKey: "preferred_launch_date",
      label: "Preferred Target Launch Date",
      inputType: "DATE",
      sortOrder: 2,
      isRequired: true,
    },
    {
      id: "q-project-urgency",
      questionKey: "project_urgency",
      label: "Project Urgency & Key External Deadlines",
      inputType: "RADIO",
      options: [
        { value: "standard", label: "Standard schedule (Quality & thoroughness first)" },
        { value: "time_sensitive", label: "Time-sensitive (Tied to an upcoming event, campaign, or launch)" },
        { value: "urgent", label: "Urgent / Fast-track delivery needed" },
      ],
      sortOrder: 3,
      isRequired: true,
    },
    {
      id: "q-payment-arrangement",
      questionKey: "preferred_payment_arrangement",
      label: "Preferred Milestone Payment Arrangement",
      inputType: "SELECT",
      options: [
        { value: "50_50", label: "50% Mobilisation / 50% Upon Completion" },
        { value: "50_30_20", label: "50% Start / 30% Design Approval / 20% Pre-Launch" },
        { value: "40_30_30", label: "40% Start / 30% Mid-Milestone / 30% Launch" },
        { value: "custom", label: "Other corporate procurement schedule" },
      ],
      sortOrder: 4,
      isRequired: false,
    },
    {
      id: "q-support-maintenance",
      questionKey: "post_launch_support_requirements",
      label: "Expected Revision Arrangements & Post-Launch Support",
      inputType: "TEXTAREA",
      validationRules: { placeholder: "Any specific SLA, warranty period, or monthly retainer notes..." },
      sortOrder: 5,
      isRequired: false,
    },
  ],
};

const SECTION_10_LEGAL_COMPLIANCE: SectionBlueprint = {
  id: "sec-10-legal-compliance",
  sectionKey: "legal_compliance",
  title: "10. Legal, Privacy & Compliance",
  description:
    "Identify legal pages, data privacy obligations (such as NDPA / GDPR), intellectual property, and industry regulations.",
  sortOrder: 10,
  isRequired: true,
  questions: [
    {
      id: "q-privacy-policy",
      questionKey: "privacy_policy_availability",
      label: "Privacy Policy Availability",
      inputType: "RADIO",
      options: [
        { value: "client_provides", label: "We have a legal Privacy Policy ready to provide" },
        { value: "need_standard_template", label: "Please provide a standard compliant Privacy Policy template for our review" },
      ],
      sortOrder: 1,
      isRequired: true,
    },
    {
      id: "q-terms-conditions",
      questionKey: "terms_and_conditions_availability",
      label: "Terms & Conditions / Terms of Service Availability",
      inputType: "RADIO",
      options: [
        { value: "client_provides", label: "We have Terms & Conditions ready to provide" },
        { value: "need_standard_template", label: "Please provide a standard Terms & Conditions layout for our review" },
      ],
      sortOrder: 2,
      isRequired: true,
    },
    {
      id: "q-cookies-data",
      questionKey: "cookie_and_data_collection",
      label: "Cookie Consent & Personal Data Collection Requirements (NDPA / GDPR)",
      inputType: "TEXTAREA",
      validationRules: {
        placeholder: "e.g. Cookie consent banner required, NDPA data processing notice on forms...",
      },
      sortOrder: 3,
      isRequired: false,
    },
    {
      id: "q-regulatory-compliance",
      questionKey: "regulatory_requirements",
      label: "Industry-Specific Regulatory or Licensing Disclosures",
      inputType: "TEXTAREA",
      validationRules: {
        placeholder: "e.g. CBN, SEC, NAFDAC, NUC accreditation numbers, medical/financial disclaimers...",
      },
      sortOrder: 4,
      isRequired: false,
    },
  ],
};

// -----------------------------------------------------------------------------
// Category-Specific Adaptive Sections (Section 8 of prompt.md)
// -----------------------------------------------------------------------------

const SPECIAL_CORPORATE_SECTION: SectionBlueprint = {
  id: "sec-spec-corporate",
  sectionKey: "corporate_specifics",
  title: "Corporate & Service Line Specifics",
  description:
    "Detail your service lines, lead generation workflow, case studies, team profiles, and branch network.",
  sortOrder: 11,
  isRequired: true,
  questions: [
    {
      id: "q-corp-services",
      questionKey: "corporate_business_services",
      label: "Core Business Services & Practice Areas",
      inputType: "TEXTAREA",
      validationRules: { placeholder: "List your main service offerings in order of priority..." },
      sortOrder: 1,
      isRequired: true,
    },
    {
      id: "q-corp-lead-gen",
      questionKey: "corporate_enquiries_and_leads",
      label: "Service Enquiry, Quote Request & Lead Routing Workflow",
      inputType: "TEXTAREA",
      validationRules: { placeholder: "How should service enquiries be captured and routed to your sales team?" },
      sortOrder: 2,
      isRequired: true,
    },
    {
      id: "q-corp-portfolio-branches",
      questionKey: "corporate_portfolio_team_branches",
      label: "Case Studies, Executive Team Profiles & Branch Locations",
      inputType: "TEXTAREA",
      validationRules: { placeholder: "Describe case studies, number of leadership bios, and branch office locations..." },
      sortOrder: 3,
      isRequired: false,
    },
  ],
};

const SPECIAL_ECOMMERCE_SECTION: SectionBlueprint = {
  id: "sec-spec-ecommerce",
  sectionKey: "ecommerce_specifics",
  title: "E-Commerce Storefront & Fulfilment Specifics",
  description:
    "Detail your product variations, checkout experience, inventory rules, shipping zones, and customer accounts.",
  sortOrder: 11,
  isRequired: true,
  questions: [
    {
      id: "q-ecom-variations",
      questionKey: "ecommerce_product_variations",
      label: "Product Catalogue Structure & Variations (Sizes, Colours, Bundles, Digital vs Physical)",
      inputType: "TEXTAREA",
      validationRules: { placeholder: "Describe product attributes, variants, SKU structure..." },
      sortOrder: 1,
      isRequired: true,
    },
    {
      id: "q-ecom-checkout-shipping",
      questionKey: "ecommerce_checkout_and_shipping",
      label: "Checkout Flow, Guest Checkout, Delivery Zones & Logistics Partners",
      inputType: "TEXTAREA",
      validationRules: { placeholder: "Do you allow guest checkout? How are shipping rates calculated?" },
      sortOrder: 2,
      isRequired: true,
    },
  ],
};

const SPECIAL_EDUCATION_SECTION: SectionBlueprint = {
  id: "sec-spec-education",
  sectionKey: "education_specifics",
  title: "Educational Institution Specifics",
  description:
    "Capture academic levels, admissions, student/parent portals, fee payments, results, and learning management needs.",
  sortOrder: 11,
  isRequired: true,
  questions: [
    {
      id: "q-edu-levels-programmes",
      questionKey: "education_levels_and_programmes",
      label: "School / Institution Levels, Faculties & Academic Programmes",
      inputType: "TEXTAREA",
      validationRules: { placeholder: "e.g. Early Years, Primary, Secondary, Undergraduate, Postgraduate, Short Courses..." },
      sortOrder: 1,
      isRequired: true,
    },
    {
      id: "q-edu-admissions",
      questionKey: "education_admissions_and_applications",
      label: "Admissions Process, Online Application Forms & Fee Payments",
      inputType: "TEXTAREA",
      validationRules: { placeholder: "Describe how prospective students apply, upload documents, and pay application/tuition fees..." },
      sortOrder: 2,
      isRequired: true,
    },
    {
      id: "q-edu-portals",
      questionKey: "education_portals_results_lms",
      label: "Student Portal, Parent Portal, Academic Results, LMS & Staff Directory Requirements",
      inputType: "TEXTAREA",
      validationRules: { placeholder: "Specify portal requirements or integration with existing school management software..." },
      sortOrder: 3,
      isRequired: true,
    },
  ],
};

const SPECIAL_NGO_SECTION: SectionBlueprint = {
  id: "sec-spec-ngo",
  sectionKey: "ngo_specifics",
  title: "NGO & Non-Profit Specifics",
  description:
    "Detail your mission, programme areas, beneficiaries, online donations, volunteer onboarding, and impact reports.",
  sortOrder: 11,
  isRequired: true,
  questions: [
    {
      id: "q-ngo-mission-programmes",
      questionKey: "ngo_mission_and_programmes",
      label: "Mission, Vision, Programme Areas & Target Beneficiaries",
      inputType: "TEXTAREA",
      validationRules: { placeholder: "Describe your core interventions, thematic areas, and communities served..." },
      sortOrder: 1,
      isRequired: true,
    },
    {
      id: "q-ngo-donations-volunteers",
      questionKey: "ngo_donations_and_volunteers",
      label: "One-Time / Recurring Donations, Donor Receipts & Volunteer Registration",
      inputType: "TEXTAREA",
      validationRules: { placeholder: "Which currencies/gateways for donations? What info is collected from volunteers?" },
      sortOrder: 2,
      isRequired: true,
    },
    {
      id: "q-ngo-impact-events",
      questionKey: "ngo_impact_reports_events_partners",
      label: "Impact Reports, Events Calendar & Institutional Partnerships",
      inputType: "TEXTAREA",
      validationRules: { placeholder: "Annual report downloads, grant donor logos, upcoming field events..." },
      sortOrder: 3,
      isRequired: false,
    },
  ],
};

const SPECIAL_PORTFOLIO_SECTION: SectionBlueprint = {
  id: "sec-spec-portfolio",
  sectionKey: "portfolio_specifics",
  title: "Personal Brand & Portfolio Specifics",
  description:
    "Highlight your featured works, media kit, speaking engagements, testimonials, and booking workflow.",
  sortOrder: 11,
  isRequired: true,
  questions: [
    {
      id: "q-port-showcase",
      questionKey: "portfolio_featured_work_categories",
      label: "Portfolio Categories, Featured Projects & Media Formats (Images, Video, Case Studies)",
      inputType: "TEXTAREA",
      validationRules: { placeholder: "How should your projects or creative works be categorised and presented?" },
      sortOrder: 1,
      isRequired: true,
    },
    {
      id: "q-port-speaking-booking",
      questionKey: "portfolio_speaking_press_booking",
      label: "Biography, Press/Media Kit, Speaking Topics & Client Inquiry Flow",
      inputType: "TEXTAREA",
      validationRules: { placeholder: "Downloadable CV/media kit, booking calendar, newsletter signup..." },
      sortOrder: 2,
      isRequired: false,
    },
  ],
};

const SPECIAL_WEB_APP_SECTION: SectionBlueprint = {
  id: "sec-spec-webapp",
  sectionKey: "webapp_specifics",
  title: "Web Application & Customer Portal Specifics",
  description:
    "Define user roles, core workflows, data models, dashboard views, and external API integrations.",
  sortOrder: 11,
  isRequired: true,
  questions: [
    {
      id: "q-app-workflows",
      questionKey: "webapp_user_roles_and_workflows",
      label: "Core User Journeys, Roles & Step-by-Step Business Workflows",
      inputType: "TEXTAREA",
      validationRules: { placeholder: "Walk through what each user role does from sign-in to task completion..." },
      sortOrder: 1,
      isRequired: true,
    },
    {
      id: "q-app-data-reporting",
      questionKey: "webapp_data_entities_and_reporting",
      label: "Key Data Records, Dashboards, Notifications & Audit Requirements",
      inputType: "TEXTAREA",
      validationRules: { placeholder: "What records are created, approved, exported, or visualised?" },
      sortOrder: 2,
      isRequired: true,
    },
  ],
};

const SPECIAL_CUSTOM_SECTION: SectionBlueprint = {
  id: "sec-spec-custom",
  sectionKey: "custom_specifics",
  title: "Custom Platform & Process Specification",
  description:
    "Capture bespoke business workflows, multi-role interactions, data architecture, and special technical constraints.",
  sortOrder: 11,
  isRequired: true,
  questions: [
    {
      id: "q-custom-process",
      questionKey: "custom_detailed_process_description",
      label: "Detailed Business Process, User Roles & Workflow Specification",
      inputType: "TEXTAREA",
      validationRules: { placeholder: "Describe the end-to-end business process this platform will power..." },
      sortOrder: 1,
      isRequired: true,
    },
    {
      id: "q-custom-data-tech",
      questionKey: "custom_data_reporting_and_special_tech",
      label: "Data Requirements, Custom Reporting, Integrations & Special Technical Constraints",
      inputType: "TEXTAREA",
      validationRules: { placeholder: "Specify custom APIs, compliance rules, high-availability or reporting needs..." },
      sortOrder: 2,
      isRequired: true,
    },
  ],
};

function buildSectionsWithSpecial(specialSection: SectionBlueprint): SectionBlueprint[] {
  return [
    SECTION_1_BUSINESS_INFO,
    SECTION_2_OBJECTIVES,
    SECTION_3_TARGET_AUDIENCE,
    SECTION_4_STRUCTURE_CONTENT,
    SECTION_5_DESIGN_BRANDING,
    SECTION_6_FUNCTIONAL_REQUIREMENTS,
    SECTION_7_TECHNICAL_INFRASTRUCTURE,
    SECTION_8_CONTENT_MANAGEMENT,
    SECTION_9_BUDGET_TIMELINE,
    SECTION_10_LEGAL_COMPLIANCE,
    specialSection,
  ];
}

export const DEFAULT_QUESTIONNAIRE_TEMPLATES: TemplateBlueprint[] = [
  {
    id: "tpl-corporate-v1",
    name: "Corporate / Business Website Discovery",
    websiteCategory: "CORPORATE",
    description:
      "Comprehensive discovery template for corporate organisations, professional services firms, B2B companies, and multi-branch enterprises.",
    isActive: true,
    version: 1,
    sections: buildSectionsWithSpecial(SPECIAL_CORPORATE_SECTION),
  },
  {
    id: "tpl-ecommerce-v1",
    name: "E-Commerce & Online Store Discovery",
    websiteCategory: "ECOMMERCE",
    description:
      "Tailored for retail brands, product catalogues, online checkout, payment gateway integration, inventory, and shipping logistics.",
    isActive: true,
    version: 1,
    sections: buildSectionsWithSpecial(SPECIAL_ECOMMERCE_SECTION),
  },
  {
    id: "tpl-education-v1",
    name: "Educational Institution Website Discovery",
    websiteCategory: "EDUCATION",
    description:
      "Designed for schools, universities, training academies, and colleges requiring admissions, portals, fee payments, and programme directories.",
    isActive: true,
    version: 1,
    sections: buildSectionsWithSpecial(SPECIAL_EDUCATION_SECTION),
  },
  {
    id: "tpl-ngo-v1",
    name: "NGO / Non-Profit & Foundation Discovery",
    websiteCategory: "NGO",
    description:
      "Built for non-profits, foundations, and development programmes requiring impact storytelling, donor payments, and volunteer onboarding.",
    isActive: true,
    version: 1,
    sections: buildSectionsWithSpecial(SPECIAL_NGO_SECTION),
  },
  {
    id: "tpl-portfolio-v1",
    name: "Personal Brand & Creative Portfolio Discovery",
    websiteCategory: "PORTFOLIO",
    description:
      "Focused template for executives, consultants, creatives, speakers, and agencies showcasing case studies and booking enquiries.",
    isActive: true,
    version: 1,
    sections: buildSectionsWithSpecial(SPECIAL_PORTFOLIO_SECTION),
  },
  {
    id: "tpl-webapp-v1",
    name: "Web Application & Customer Portal Discovery",
    websiteCategory: "WEB_APP",
    description:
      "Engineered for authenticated client portals, SaaS products, member dashboards, and workflow automation systems.",
    isActive: true,
    version: 1,
    sections: buildSectionsWithSpecial(SPECIAL_WEB_APP_SECTION),
  },
  {
    id: "tpl-custom-v1",
    name: "Custom Website & Bespoke Platform Discovery",
    websiteCategory: "CUSTOM",
    description:
      "Flexible full-spectrum discovery template for multi-role bespoke web platforms, complex integrations, and custom processes.",
    isActive: true,
    version: 1,
    sections: buildSectionsWithSpecial(SPECIAL_CUSTOM_SECTION),
  },
];

export function getTemplateBlueprintById(
  templateId: string
): TemplateBlueprint | undefined {
  return DEFAULT_QUESTIONNAIRE_TEMPLATES.find((t) => t.id === templateId);
}

export function getTemplateBlueprintByCategory(
  category: WebsiteCategory
): TemplateBlueprint {
  return (
    DEFAULT_QUESTIONNAIRE_TEMPLATES.find(
      (t) => t.websiteCategory === category
    ) ?? DEFAULT_QUESTIONNAIRE_TEMPLATES[0]
  );
}

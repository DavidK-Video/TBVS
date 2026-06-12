export interface SiteConfig {
  company_name: string;
  address: string;
  hotline: string;
  zalo: string;
  email_primary: string;
  email_secondary: string;
  facebook: string;
  fanpage: string;
  sheet_id: string;
  form_id: string;
  folder_main_id: string;
  kqkd_report_id: string;
  xnt_report_id: string;
  invoice_pdf_id: string;
  sample_files_id: string;
  gemini_api_key?: string;
  hero_image?: string;
  price_list_url?: string;
  catalogue_url?: string;
  bot_knowledge?: string;
  bank_account_name?: string;
  bank_account_number?: string;
  bank_name?: string;
  gemini_model?: string;
}

export interface ChatMessage {
  role: "user" | "model" | "system";
  content: string;
}

export interface Asset {
  id: string;
  url: string;
  type: "image" | "pdf";
  name: string;
  createdAt: string;
}

import { Language } from '../types';

export const translations = {
  en: {
    // Navigation
    nav_brand: 'DocuRecover',
    nav_dashboard: 'Dashboard',
    nav_documents: 'My Documents',
    nav_assistant: 'Recovery Assistant',
    nav_plan: 'Recovery Plan',
    nav_resources: 'Official Resources',
    nav_settings: 'Settings',
    nav_signin: 'Sign In',
    nav_signup: 'Sign Up',
    nav_signout: 'Sign Out',

    // Landing Page
    landing_badge: 'Malaysia Disaster Relief AI Platform',
    landing_hero_title: 'Rebuild Your Identity After Disaster Strikes',
    landing_hero_subtitle:
      'AI-powered document replacement assistant for Malaysian flood, fire, and landslide survivors. Get personalized step-by-step guidance to recover lost MyKad, Birth Certificates, Passports, and more.',
    landing_hero_cta: 'Start Document Recovery',
    landing_hero_cta_secondary: 'Chat with AI Assistant',
    landing_how_it_works_title: 'How DocuRecover Helps You',
    landing_how_it_works_subtitle: 'Three simple steps to regain your legal documents and entitlements',
    landing_step_1_title: '1. Report & Upload',
    landing_step_1_desc: 'Log your lost documents or snap a photo of damaged IDs for immediate AI damage evaluation.',
    landing_step_2_title: '2. Instant AI Assessment',
    landing_step_2_desc: 'Gemini AI analyzes legibility, determines document validity, and identifies official authority protocols.',
    landing_step_3_title: '3. Actionable Checklist',
    landing_step_3_desc: 'Receive tailored recovery tasks with Malaysian government forms, fee waivers, and contact information.',
    landing_feature_ai_title: 'Smart Vision Inspection',
    landing_feature_ai_desc: 'State-of-the-art vision models evaluate water-damaged and fire-scorched Malaysian IDs.',
    landing_feature_gov_title: 'Official JPN, JPJ & IMI Guides',
    landing_feature_gov_desc: 'Accurate and up-to-date procedures, required police reports, and office locations.',
    landing_feature_offline_title: 'Disaster Relief Fee Waivers',
    landing_feature_offline_desc: 'Know your rights for disaster victim fee exemptions under NADMA and agency guidelines.',

    // Authentication
    auth_login_title: 'Welcome Back',
    auth_login_subtitle: 'Access your document recovery dashboard',
    auth_signup_title: 'Create Your Account',
    auth_signup_subtitle: 'Begin tracking your lost or damaged documents',
    auth_name: 'Full Name (as per MyKad)',
    auth_email: 'Email Address',
    auth_password: 'Password',
    auth_submit_login: 'Sign In',
    auth_submit_signup: 'Create Account',
    auth_no_account: "Don't have an account? Sign up",
    auth_have_account: 'Already have an account? Sign in',

    // Onboarding / Case Setup
    onboarding_title: 'Incident Details',
    onboarding_subtitle: 'Provide incident details so we can customize your official recovery procedure and fee exemptions.',
    onboarding_step1: 'Disaster Type',
    onboarding_step2: 'Incident Details',
    onboarding_step3: 'Documents Affected',
    disaster_type: 'Disaster Type',
    disaster_flood: 'Flood (Banjir)',
    disaster_fire: 'Fire (Kebakaran)',
    disaster_landslide: 'Landslide (Tanah Runtuh)',
    disaster_other: 'Other Disaster / Emergency',
    incident_date: 'Date of Incident',
    incident_location: 'Location (State / District)',
    onboarding_complete_btn: 'Generate Recovery Plan',

    // Dashboard
    dash_welcome: 'Recovery Dashboard',
    dash_total_docs: 'Total Tracked',
    dash_lost_docs: 'Lost Documents',
    dash_damaged_docs: 'Damaged Documents',
    dash_recovered_docs: 'Recovered Documents',
    dash_overall_progress: 'Overall Recovery Progress',
    dash_recent_activity: 'Recent Documents',
    dash_quick_actions: 'Quick Actions',
    dash_new_doc: 'Add New Document',
    dash_scan_doc: 'Analyze Damaged Doc',
    dash_open_assistant: 'Ask AI Assistant',
    dash_view_plan: 'View Checklist',

    // Documents Page & Management
    doc_title: 'Document Inventory',
    doc_subtitle: 'Manage and monitor all replacement applications across government agencies.',
    doc_name: 'Document Name',
    doc_type: 'Category',
    doc_authority: 'Issuing Authority',
    doc_status: 'Current Status',
    doc_progress: 'Progress',
    doc_date_lost: 'Date Lost/Damaged',
    doc_actions: 'Actions',
    doc_empty: 'No documents tracked yet. Add your first document to begin recovery.',
    doc_add_title: 'Record Document',
    doc_edit_title: 'Update Document Status',
    doc_notes: 'Notes / Incident References',

    // Document Statuses
    status_safe: 'Safe',
    status_damaged: 'Damaged',
    status_lost: 'Lost',
    status_recovered: 'Recovered',

    // Document Types
    doc_mykad: 'MyKad (National ID)',
    doc_birth_certificate: 'Birth Certificate (Sijil Lahir)',
    doc_passport: 'Malaysian Passport',
    doc_driving_licence: 'Driving Licence (Lesen Memandu)',
    doc_academic_certificate: 'Academic Certificate (SPM / Degree)',

    // Upload & AI Vision Assessment
    upload_title: 'AI Document Damage Assessment',
    upload_subtitle: 'Upload a clear photo or scan of your damaged document for instant condition analysis.',
    upload_drop_text: 'Drag & drop your document photo here, or browse files',
    upload_supported_formats: 'PNG, JPG, or WEBP up to 10MB',
    upload_analyzing: 'Analyzing damage with Gemini Vision...',
    upload_confidence: 'Detection Confidence',
    upload_damage_level: 'Assessed Damage Level',
    upload_recommendation: 'Recommended Next Step',
    upload_assessment_summary: 'AI Technical Findings',
    upload_submit_btn: 'Save to My Recovery List',

    // Damage Levels
    damage_none: 'No Damage',
    damage_minor: 'Minor Damage (Readable)',
    damage_moderate: 'Moderate (Partially Illegible)',
    damage_severe: 'Severe (Significant Loss)',
    damage_destroyed: 'Completely Destroyed',

    // AI Assistant & Chat
    chat_title: 'DocuRecover AI Concierge',
    chat_subtitle: 'Specialized assistant trained on Malaysian government guidelines, emergency SOPs, and fee waivers.',
    chat_placeholder: 'Ask about police report requirements, JPN replacement fees, fee waiver waivers...',
    chat_quick_prompts: 'Quick Inquiries',
    chat_quick_prompt_1: 'How do I get a free MyKad replacement after a flood?',
    chat_quick_prompt_2: 'What documents are required to replace a lost birth certificate?',
    chat_quick_prompt_3: 'Can I replace my driving licence at UTC counters?',
    chat_sources: 'Verified Government Sources',
    chat_clear: 'Clear Conversation',
    chat_empty: 'No messages yet. Ask any question about recovering your documents!',

    // Recovery Plan / Checklist
    plan_title: 'Disaster Recovery Action Plan',
    plan_subtitle: 'Prioritized checklist of tasks to replace all your affected official documents.',
    plan_checklist: 'Action Checklist',
    plan_progress: 'Completion',
    plan_add_task: 'Add Custom Task',
    plan_completed: 'Completed',
    plan_remaining: 'Tasks Remaining',
    plan_no_tasks: 'No tasks scheduled. Add documents to generate a tailored recovery checklist.',
    plan_mark_complete: 'Mark as Done',
    plan_mark_incomplete: 'Mark as Incomplete',

    // Resources Page
    resources_title: 'Official Malaysian Agency Directory',
    resources_subtitle: 'Verified contact channels, operating hours, and portal links for disaster relief document recovery.',
    resources_search: 'Search by agency name, document, or city...',
    resources_filter_all: 'All Agencies',
    resources_filter_jpn: 'JPN (Registration)',
    resources_filter_jpj: 'JPJ (Transport)',
    resources_filter_imi: 'Immigration (Passports)',
    resources_hotline: 'Disaster Emergency Hotlines',
    resources_fee_waiver_info: 'Special Flood Victim Waiver Guidelines',

    // Common / Global
    common_loading: 'Loading...',
    common_error: 'An error occurred. Please try again.',
    common_success: 'Operation completed successfully.',
    common_cancel: 'Cancel',
    common_save: 'Save Changes',
    common_delete: 'Delete',
    common_add: 'Add',
    common_edit: 'Edit',
    common_back: 'Back',
    common_next: 'Next',
    common_submit: 'Submit',
    common_search: 'Search',
    common_view_details: 'View Details',
    common_open_link: 'Visit Official Portal',
    common_na: 'N/A',
  },
  ms: {
    // Navigation
    nav_brand: 'DocuRecover',
    nav_dashboard: 'Papan Pemuka',
    nav_documents: 'Dokumen Saya',
    nav_assistant: 'Pembantu AI',
    nav_plan: 'Pelan Pemulihan',
    nav_resources: 'Sumber Rasmi',
    nav_settings: 'Tetapan',
    nav_signin: 'Log Masuk',
    nav_signup: 'Daftar Akaun',
    nav_signout: 'Log Keluar',

    // Landing Page
    landing_badge: 'Platform AI Bantuan Bencana Malaysia',
    landing_hero_title: 'Pulihkan Dokumen Pengenalan Diri Selepas Bencana',
    landing_hero_subtitle:
      'Pembantu pintar penggantian dokumen rasmi untuk mangsa banjir, kebakaran, dan tanah runtuh di Malaysia. Dapatkan panduan langkah demi langkah memulihkan MyKad, Sijil Kelahiran, Pasport, dan banyak lagi.',
    landing_hero_cta: 'Mulakan Pemulihan Dokumen',
    landing_hero_cta_secondary: 'Tanya Pembantu AI',
    landing_how_it_works_title: 'Bagaimana DocuRecover Membantu Anda',
    landing_how_it_works_subtitle: 'Tiga langkah mudah untuk mendapatkan kembali dokumen sah dan hak anda',
    landing_step_1_title: '1. Lapor & Muat Naik',
    landing_step_1_desc: 'Senaraikan dokumen hilang atau tangkap gambar dokumen yang rosak untuk penilaian kerosakan segera.',
    landing_step_2_title: '2. Penilaian Pintar AI',
    landing_step_2_desc: 'Gemini AI menganalisis kebolehbacaan, tahap kerosakan, dan mengenal pasti prosedur agensi berkaitan.',
    landing_step_3_title: '3. Senarai Semak Tindakan',
    landing_step_3_desc: 'Terima senarai tugas tersusun lengkap bersama borang kerajaan, pengecualian fi bencana, dan nombor perhubungan.',
    landing_feature_ai_title: 'Pemeriksaan Visual Pintar',
    landing_feature_ai_desc: 'Model visi tercanggih mengesan tahap kerosakan air banjir atau kesan kebakaran pada kad pengenalan.',
    landing_feature_gov_title: 'Panduan Rasmi JPN, JPJ & Imigresen',
    landing_feature_gov_desc: 'Prosedur tepat dan terkini, keperluan laporan polis, serta lokasi pejabat terdekat.',
    landing_feature_offline_title: 'Pengecualian Fi Bencana',
    landing_feature_offline_desc: 'Ketahui hak pengecualian bayaran gantian bagi mangsa bencana di bawah pekeliling agensi.',

    // Authentication
    auth_login_title: 'Selamat Kembali',
    auth_login_subtitle: 'Akses papan pemuka pemulihan dokumen anda',
    auth_signup_title: 'Daftar Akaun Baharu',
    auth_signup_subtitle: 'Mula menjejak dokumen yang hilang atau musnah',
    auth_name: 'Nama Penuh (seperti dalam MyKad)',
    auth_email: 'Alamat Emel',
    auth_password: 'Kata Laluan',
    auth_submit_login: 'Log Masuk',
    auth_submit_signup: 'Daftar Akaun',
    auth_no_account: 'Belum mempunyai akaun? Daftar sekarang',
    auth_have_account: 'Sudah mempunyai akaun? Log masuk',

    // Onboarding / Case Setup
    onboarding_title: 'Maklumat Insiden Bencana',
    onboarding_subtitle: 'Sila berikan butiran bencana supaya kami dapat menyesuaikan panduan pemulihan dan bantuan fi.',
    onboarding_step1: 'Jenis Bencana',
    onboarding_step2: 'Butiran Kejadian',
    onboarding_step3: 'Dokumen Terjejas',
    disaster_type: 'Jenis Bencana',
    disaster_flood: 'Banjir',
    disaster_fire: 'Kebakaran',
    disaster_landslide: 'Tanah Runtuh',
    disaster_other: 'Bencana / Kecemasan Lain',
    incident_date: 'Tarikh Kejadian',
    incident_location: 'Lokasi (Negeri / Daerah)',
    onboarding_complete_btn: 'Hasilkan Pelan Pemulihan',

    // Dashboard
    dash_welcome: 'Papan Pemuka Pemulihan',
    dash_total_docs: 'Jumlah Dokumen',
    dash_lost_docs: 'Dokumen Hilang',
    dash_damaged_docs: 'Dokumen Rosak',
    dash_recovered_docs: 'Telah Dipulihkan',
    dash_overall_progress: 'Kemajuan Keseluruhan',
    dash_recent_activity: 'Dokumen Terkini',
    dash_quick_actions: 'Tindakan Pantas',
    dash_new_doc: 'Tambah Dokumen',
    dash_scan_doc: 'Imbas Dokumen Rosak',
    dash_open_assistant: 'Tanya Pembantu AI',
    dash_view_plan: 'Lihat Senarai Semak',

    // Documents Page & Management
    doc_title: 'Inventori Dokumen',
    doc_subtitle: 'Urus dan pantau status permohonan penggantian di pelbagai agensi kerajaan.',
    doc_name: 'Nama Dokumen',
    doc_type: 'Kategori',
    doc_authority: 'Agensi Pengeluar',
    doc_status: 'Status Semasa',
    doc_progress: 'Kemajuan',
    doc_date_lost: 'Tarikh Hilang/Rosak',
    doc_actions: 'Tindakan',
    doc_empty: 'Tiada dokumen dijejaki lagi. Tambah dokumen pertama anda untuk memulakan pemulihan.',
    doc_add_title: 'Daftar Dokumen',
    doc_edit_title: 'Kemas Kini Status Dokumen',
    doc_notes: 'Nota / Rujukan Laporan',

    // Document Statuses
    status_safe: 'Selamat',
    status_damaged: 'Rosak',
    status_lost: 'Hilang',
    status_recovered: 'Dipulihkan',

    // Document Types
    doc_mykad: 'MyKad (Kad Pengenalan)',
    doc_birth_certificate: 'Sijil Kelahiran (Surat Beranak)',
    doc_passport: 'Pasport Malaysia',
    doc_driving_licence: 'Lesen Memandu Malaysia',
    doc_academic_certificate: 'Sijil Akademik (SPM / Universiti)',

    // Upload & AI Vision Assessment
    upload_title: 'Penilaian Kerosakan Dokumen AI',
    upload_subtitle: 'Muat naik gambar dokumen yang rosak untuk analisis keadaan fizikal dan kebolehbacaan segera.',
    upload_drop_text: 'Tarik & lepas gambar dokumen di sini, atau pilih fail',
    upload_supported_formats: 'PNG, JPG, atau WEBP sehingga 10MB',
    upload_analyzing: 'Menganalisis tahap kerosakan menggunakan Gemini Vision...',
    upload_confidence: 'Keyakinan Pengesanan',
    upload_damage_level: 'Tahap Kerosakan',
    upload_recommendation: 'Tindakan Disyorkan',
    upload_assessment_summary: 'Laporan Penilaian AI',
    upload_submit_btn: 'Simpan ke Senarai Pemulihan',

    // Damage Levels
    damage_none: 'Tiada Kerosakan',
    damage_minor: 'Kerosakan Ringan (Boleh Dibaca)',
    damage_moderate: 'Kerosakan Sederhana (Sebahagian Boleh Dibaca)',
    damage_severe: 'Kerosakan Teruk (Sukar Dibaca)',
    damage_destroyed: 'Musnah Sepenuhnya',

    // AI Assistant & Chat
    chat_title: 'Pembantu Maya DocuRecover',
    chat_subtitle: 'Dilatih dengan prosedur rasmi agensi kerajaan Malaysia, SOP kecemasan, dan pengecualian bayaran.',
    chat_placeholder: 'Tanya tentang syarat laporan polis, fi gantian JPN, surat akuan bersumpah...',
    chat_quick_prompts: 'Soalan Lazim',
    chat_quick_prompt_1: 'Bagaimanakah cara mendapatkan MyKad gantian percuma mangsa banjir?',
    chat_quick_prompt_2: 'Apakah dokumen yang diperlukan untuk menggantikan sijil lahir yang hilang?',
    chat_quick_prompt_3: 'Bolehkah saya menggantikan lesen memandu di kaunter UTC?',
    chat_sources: 'Sumber Rasmi Kerajaan',
    chat_clear: 'Kosongkan Perbualan',
    chat_empty: 'Belum ada mesej. Sila ajukan sebarang soalan mengenai pemulihan dokumen anda!',

    // Recovery Plan / Checklist
    plan_title: 'Pelan Tindakan Pemulihan Bencana',
    plan_subtitle: 'Senarai semak berkeutamaan bagi menggantikan kesemua dokumen rasmi anda yang terjejas.',
    plan_checklist: 'Senarai Semak Tindakan',
    plan_progress: 'Tahap Selesai',
    plan_add_task: 'Tambah Tugas Tersuai',
    plan_completed: 'Selesai',
    plan_remaining: 'Tugasan Berbaki',
    plan_no_tasks: 'Tiada tugasan dijadualkan. Tambah dokumen untuk menjana senarai tindakan automatik.',
    plan_mark_complete: 'Tandakan Selesai',
    plan_mark_incomplete: 'Tandakan Belum Selesai',

    // Resources Page
    resources_title: 'Direktori Rasmi Agensi Kerajaan',
    resources_subtitle: 'Maklumat perhubungan sah, waktu operasi, dan pautan portal bagi urusan mangsa bencana.',
    resources_search: 'Cari nama agensi, jenis dokumen, atau daerah...',
    resources_filter_all: 'Semua Agensi',
    resources_filter_jpn: 'JPN (Pendaftaran)',
    resources_filter_jpj: 'JPJ (Pengangkutan)',
    resources_filter_imi: 'Imigresen (Pasport)',
    resources_hotline: 'Talian Bantuan Kecemasan Bencana',
    resources_fee_waiver_info: 'Garis Panduan Pengecualian Bayaran Mangsa Banjir',

    // Common / Global
    common_loading: 'Sedang memuat...',
    common_error: 'Ralat berlaku. Sila cuba lagi.',
    common_success: 'Tindakan berjaya diselesaikan.',
    common_cancel: 'Batal',
    common_save: 'Simpan Perubahan',
    common_delete: 'Padam',
    common_add: 'Tambah',
    common_edit: 'Sunting',
    common_back: 'Kembali',
    common_next: 'Seterusnya',
    common_submit: 'Hantar',
    common_search: 'Cari',
    common_view_details: 'Lihat Butiran',
    common_open_link: 'Buka Portal Rasmi',
    common_na: 'Tiada',
  },
} as const;

export type TranslationKey = keyof typeof translations.en;

export function t(key: TranslationKey, language: Language = 'en'): string {
  const langKey = language === 'ms' ? 'ms' : 'en';
  return (translations[langKey] as Record<string, string>)[key] || (translations.en as Record<string, string>)[key] || key;
}

export function getTranslation(key: TranslationKey, language: Language = 'en'): string {
  return t(key, language);
}

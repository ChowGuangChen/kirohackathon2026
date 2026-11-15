import { DocumentInfo, DocumentType } from '../types';

export const knowledgeBase: Record<DocumentType, DocumentInfo> = {
  mykad: {
    type: 'mykad',
    nameEn: 'MyKad (National Identity Card)',
    nameMs: 'MyKad (Kad Pengenalan)',
    authority: 'Jabatan Pendaftaran Negara (JPN)',
    authorityMs: 'Jabatan Pendaftaran Negara (JPN)',
    website: 'https://www.jpn.gov.my',
    phone: '03-8000 8000 / 1-300-80-0100',
    address: 'Ibu Pejabat Jabatan Pendaftaran Negara Putrajaya, No 20, Persiaran Perdana, Presint 2, 62551 Putrajaya',
    requiredDocuments: {
      en: [
        'Police report stating document loss or disaster destruction (Banjir/Kebakaran)',
        'Birth Certificate (original or photocopy if available)',
        'Supporting identity document (Passport, Driving Licence, SPM cert) if available',
        'NADMA / District Office / Village Head disaster confirmation letter (for fee waiver)',
      ],
      ms: [
        'Laporan polis menyatakan kehilangan atau kemusnahan akibat bencana (Banjir/Kebakaran)',
        'Sijil Kelahiran (salinan asal atau salinan jika ada)',
        'Dokumen pengenalan sokongan (Pasport, Lesen Memandu, Sijil SPM) jika ada',
        'Surat pengesahan mangsa bencana dari NADMA / Pejabat Daerah / Ketua Kampung (untuk pengecualian bayaran)',
      ],
    },
    procedure: {
      en: [
        'File an official police report at the nearest PDRM station or online via e-Reporting detailing disaster loss.',
        'Obtain disaster victim verification letter from temporary evacuation center (PPS) or District Office if disaster fee waiver applies.',
        'Visit any National Registration Department (JPN) branch or UTC office.',
        'Take a queue number for Replacement of Identity Card (Gantian MyKad Rosak/Hilang Bencana).',
        'Provide biometric thumbprint verification and photo capture at the JPN counter.',
        'Collect your new MyKad (same-day collection at major UTC/state headquarters within 30-45 minutes).',
      ],
      ms: [
        'Buat laporan polis rasmi di balai PDRM terdekat atau secara dalam talian melalui e-Reporting berkaitan kemusnahan bencana.',
        'Dapatkan surat pengesahan mangsa bencana dari Pusat Pemindahan Sementara (PPS) atau Pejabat Daerah bagi pengecualian bayaran.',
        'Hadir ke mana-mana cawangan Jabatan Pendaftaran Negara (JPN) atau pusat UTC.',
        'Ambil nombor giliran untuk Permohonan Gantian MyKad (Hilang Bencana Alam / Rosak).',
        'Buat pengesahan biometrik cap jari dan pengambilan gambar di kaunter JPN.',
        'Ambil MyKad baharu anda (siap dalam tempoh 30-45 minit di ibu pejabat negeri atau cawangan UTC terpilih).',
      ],
    },
    fee: {
      en: 'Standard fee: RM10 for damaged card; RM110 for 1st loss. Disaster victims are eligible for fee exemption with police report & disaster letter.',
      ms: 'Kadar biasa: RM10 gantian cip/rosak; RM110 kehilangan kali pertama. Mangsa bencana layak mendapat pengecualian bayaran dengan laporan polis & surat bencana.',
    },
    processingTime: {
      en: '30 to 45 minutes at UTC branches and state headquarters; 5 working days at sub-branches.',
      ms: '30 hingga 45 minit di UTC dan Ibu Pejabat Negeri; 5 hari bekerja di cawangan daerah.',
    },
    applicationLink: 'https://www.jpn.gov.my/my/perkhidmatan/kad-pengenalan',
    notes: {
      en: 'Malaysian government under NADMA guidelines waives replacement penalty fees for registered natural disaster victims.',
      ms: 'Kerajaan Malaysia di bawah garis panduan NADMA mengecualikan denda bayaran gantian bagi mangsa bencana alam yang disahkan.',
    },
    aiPromptHints: [
      'Mention police report is mandatory',
      'Inform about disaster victim fee waiver under JPN guidelines',
      'Suggest visiting UTC for fast 45-minute turnaround',
    ],
  },

  'birth-certificate': {
    type: 'birth-certificate',
    nameEn: 'Birth Certificate (Sijil Kelahiran)',
    nameMs: 'Sijil Kelahiran (Surat Beranak)',
    authority: 'Jabatan Pendaftaran Negara (JPN)',
    authorityMs: 'Jabatan Pendaftaran Negara (JPN)',
    website: 'https://www.jpn.gov.my',
    phone: '03-8000 8000',
    address: 'Bahagian Kelahiran, Kematian dan Anak Angkat, JPN Putrajaya / Mana-mana cawangan JPN',
    requiredDocuments: {
      en: [
        'Police report stating loss or destruction in disaster',
        'Applicant MyKad / Parent MyKad (original or copy)',
        'Copy of Marriage Certificate of parents (if available)',
        'Statutory declaration (Surat Akuan Sumpah) if birth records require verification',
      ],
      ms: [
        'Laporan polis menyatakan kehilangan atau kerosakan akibat bencana',
        'MyKad pemohon / MyKad ibu bapa (asal atau salinan)',
        'Salinan Sijil Perkahwinan ibu bapa (jika ada)',
        'Surat Akuan Sumpah jika rekod kelahiran memerlukan pengesahan lanjut',
      ],
    },
    procedure: {
      en: [
        'Lodge a police report at the nearest PDRM station describing the incident.',
        'Complete JPN Form JPN.LM12 (Application for Extract of Birth Certificate).',
        'Present applicant MyKad and parents identity information at JPN counter.',
        'Pay the nominal search and extract fee (or present disaster relief verification).',
        'Receive the computer-generated certified extract copy (Cabutan Sijil Kelahiran).',
      ],
      ms: [
        'Buat laporan polis di balai PDRM terdekat menyatakan kehilangan akibat banjir/bencana.',
        'Isi borang JPN.LM12 (Permohonan Cabutan Sijil Kelahiran).',
        'Kemukakan MyKad pemohon dan maklumat pengenalan ibu bapa di kaunter JPN.',
        'Jelaskan bayaran carian dan cabutan (atau kemukakan pengesahan mangsa bencana).',
        'Terima salinan Cabutan Sijil Kelahiran yang sah diperakui serta-merta.',
      ],
    },
    fee: {
      en: 'RM5.00 for search fee + RM5.00 for Certified Extract (Cabutan Sijil Kelahiran).',
      ms: 'RM5.00 fi carian + RM5.00 bagi Cabutan Sijil Kelahiran rasmi.',
    },
    processingTime: {
      en: 'Immediate / within 1-2 hours at JPN UTC and District Branches if digital records exist.',
      ms: 'Serta-merta / 1-2 jam di JPN UTC dan Cawangan Daerah jika rekod digital wujud.',
    },
    applicationLink: 'https://www.jpn.gov.my/my/perkhidmatan/kelahiran',
    notes: {
      en: 'Digital records from 1957 onwards are typically retrieved on the spot. For earlier births, manual archives may take 3-7 days.',
      ms: 'Rekod digital dari tahun 1957 ke atas biasanya dapat dicetak segera. Kelahiran terdahulu mungkin memerlukan semakan arkib 3-7 hari.',
    },
    aiPromptHints: [
      'Document extract is officially known as Cabutan Sijil Kelahiran (JPN.LM12)',
      'Parents IC or statutory declaration helps if original registration number is forgotten',
    ],
  },

  passport: {
    type: 'passport',
    nameEn: 'Malaysian International Passport',
    nameMs: 'Pasport Antarabangsa Malaysia',
    authority: 'Jabatan Imigresen Malaysia (JIM)',
    authorityMs: 'Jabatan Imigresen Malaysia (JIM)',
    website: 'https://www.imi.gov.my',
    phone: '03-8000 8000 / 03-8880 1555',
    address: 'Ibu Pejabat Jabatan Imigresen Malaysia, No 15, Tingkat 1-7, Persiaran Perdana, Presint 2, 62550 Putrajaya',
    requiredDocuments: {
      en: [
        'Police report explicitly stating disaster damage/loss (Fire/Flood/Landslide)',
        'Original MyKad / MyKid (must be recovered or replaced first)',
        'Disaster victim certification from Bomba (for fire) or District Office/NADMA (for flood)',
        'Remnants of damaged passport (if damaged and available)',
        'Application Form for Passport Replacement due to Loss/Damage (Borang IM.42c)',
      ],
      ms: [
        'Laporan polis rasmi menyatakan kerosakan/kehilangan akibat bencana (Banjir/Kebakaran)',
        'MyKad / MyKid asal (perlu diganti terlebih dahulu jika turut hilang)',
        'Laporan pengesahan kebakaran daripada Jabatan Bomba (kebakaran) atau Pejabat Daerah/NADMA (banjir)',
        'Sisa pasport yang rosak (jika masih ada)',
        'Borang Soal Selidik Kehilangan/Kerosakan Pasport (Borang IM.42c)',
      ],
    },
    procedure: {
      en: [
        'Replace MyKad first, as a valid MyKad is mandatory before applying for a passport.',
        'File a police report stating the loss or destruction due to natural disaster.',
        'For fire incidents, obtain the official Fire Incident Report from Jabatan Bomba dan Penyelamat.',
        'Visit the nearest Immigration Department (JIM) State Headquarters or UTC branch.',
        'Attend an inquiry interview session with the Immigration Enforcement Officer.',
        'Submit the IM.42c form together with supporting disaster documentation.',
        'Upon approval, pay passport issuance fee and collect new biometric passport (within 1-2 hours of approval).',
      ],
      ms: [
        'Gantikan MyKad terlebih dahulu, kerana MyKad sah diperlukan untuk urusan pasport.',
        'Buat laporan polis menyatakan pasport musnah/hilang akibat bencana.',
        'Bagi kebakaran, dapatkan laporan siasatan rasmi daripada Jabatan Bomba dan Penyelamat.',
        'Hadir ke Pejabat Imigresen Negeri atau cawangan UTC.',
        'Hadir sesi soal siasat bersama Pegawai Penguatkuasa Imigresen untuk pengesahan kehilangan.',
        'Hantar borang IM.42c bersama bukti dokumen bencana.',
        'Selepas kelulusan, bayar fi pasport dan ambil pasport baharu (siap dalam 1-2 jam selepas kelulusan).',
      ],
    },
    fee: {
      en: 'Passport fee: RM200 (5 years, adult) / RM100 (senior citizens & children). The standard RM300-RM1200 lost passport penalty may be fully waived for disaster victims upon Immigration Committee review.',
      ms: 'Fi pasport: RM200 (5 tahun dewasa) / RM100 (warga emas & kanak-kanak). Penalti kehilangan (RM300-RM1200) boleh dikecualikan sepenuhnya untuk mangsa bencana dengan kelulusan Jawatankuasa Imigresen.',
    },
    processingTime: {
      en: 'Inquiry and approval: 1 to 5 working days; printing: 1 hour once approved.',
      ms: 'Siasatan dan kelulusan: 1 hingga 5 hari bekerja; cetakan: 1 jam selepas diluluskan.',
    },
    applicationLink: 'https://imigresen-online.imi.gov.my',
    notes: {
      en: 'Bring physical damaged remains of the passport if possible; damaged passport investigation is faster than total lost passport investigation.',
      ms: 'Bawa cebisan pasport rosak jika ada; proses siasatan pasport rosak lebih pantas berbanding pasport hilang tanpa kesan.',
    },
    aiPromptHints: [
      'Crucial: Recover MyKad FIRST before passport',
      'Explain that disaster penalty exemption requires Bomba or NADMA proof',
    ],
  },

  'driving-licence': {
    type: 'driving-licence',
    nameEn: 'Malaysian Driving Licence (Lesen Memandu)',
    nameMs: 'Lesen Memandu Malaysia (LMM)',
    authority: 'Jabatan Pengangkutan Jalan (JPJ)',
    authorityMs: 'Jabatan Pengangkutan Jalan (JPJ)',
    website: 'https://www.jpj.gov.my',
    phone: '03-8000 8000 / 03-8892 8000 / 1-800-88-8664',
    address: 'Ibu Pejabat JPJ Malaysia, Aras 3-5, No 26, Jalan Tun Hussein, Presint 4, 62100 Putrajaya',
    requiredDocuments: {
      en: [
        'Original MyKad or temporary JPN identity document',
        'Police report stating disaster loss/damage',
        'Disaster victim verification document (for fee waiver consideration)',
        'One passport-sized photograph (white background) if updating photo',
      ],
      ms: [
        'MyKad asal atau slip pengenalan sementara JPN',
        'Laporan polis menyatakan lesen rosak/hilang dalam bencana',
        'Dokumen pengesahan mangsa bencana (untuk pertimbangan pengecualian bayaran)',
        'Sekeping gambar ukuran pasport berlatar belakang putih (jika ingin kemaskini gambar)',
      ],
    },
    procedure: {
      en: [
        'Obtain MyKad replacement or temporary identification slip from JPN first.',
        'Lodge a police report regarding the disaster incident.',
        'Visit any JPJ State Office, JPJ Branch, or JPJ counter in UTC.',
        'Fill up Form JPJ L1 (Driving Licence Application Form).',
        'Submit document at counter for immediate reprint and verification.',
        'Download the MyJPJ mobile application to instantly access your digital driving licence (e-LMM).',
      ],
      ms: [
        'Dapatkan MyKad gantian atau slip sementara daripada JPN terlebih dahulu.',
        'Buat laporan polis mengenai insiden bencana.',
        'Hadir ke mana-mana Pejabat JPJ Negeri, Cawangan JPJ atau kaunter JPJ di UTC.',
        'Isi Borang JPJ L1 (Borang Permohonan Lesen Memandu).',
        'Kemukakan dokumen di kaunter untuk cetakan semula lesen fizikal.',
        'Muat turun aplikasi MyJPJ untuk mengakses Lesen Memandu Digital (e-LMM) serta-merta tanpa bayaran.',
      ],
    },
    fee: {
      en: 'Physical card replacement: RM20. Digital licence on MyJPJ app: FREE of charge. Disaster victims may receive fee waiver during officially announced disaster periods.',
      ms: 'Gantian kad fizikal: RM20. Lesen digital di aplikasi MyJPJ: PERCUMA. Mangsa bencana layak mendapat pengecualian semasa tempoh operasi bencana diumumkan.',
    },
    processingTime: {
      en: 'Immediate / 15-30 minutes at JPJ counters or instantly via MyJPJ application.',
      ms: 'Serta-merta / 15-30 minit di kaunter JPJ atau serta-merta melalui aplikasi MyJPJ.',
    },
    applicationLink: 'https://www.jpj.gov.my/my/web/main-site/pelesenan-pemandu',
    notes: {
      en: 'Physical driving licence is no longer strictly mandatory in Malaysia. You can immediately use the free digital licence in MyJPJ app if your record is active.',
      ms: 'Lesen memandu fizikal tidak lagi wajib dibawa di Malaysia. Anda boleh menggunakan lesen digital percuma dalam aplikasi MyJPJ serta-merta sekiranya lesen masih sah.',
    },
    aiPromptHints: [
      'Highlight MyJPJ app as an instant zero-cost option',
      'Remind user that replacement fee is only RM20 if physical card is needed',
    ],
  },

  'academic-certificate': {
    type: 'academic-certificate',
    nameEn: 'Academic Certificates (SPM / STPM / Degree)',
    nameMs: 'Sijil Akademik (SPM / STPM / Ijazah)',
    authority: 'Lembaga Peperiksaan Malaysia (LPM) / MPM / University Registrar',
    authorityMs: 'Lembaga Peperiksaan Malaysia (LPM) / MPM / Pendaftar Universiti',
    website: 'https://lp.moe.gov.my / https://elpp.moe.gov.my',
    phone: '03-8884 3785 / 03-8884 3526',
    address: 'Lembaga Peperiksaan, Kementerian Pendidikan Malaysia, Blok E11, Kompleks E, 62604 Putrajaya',
    requiredDocuments: {
      en: [
        'Copy of MyKad / Replacement MyKad slip',
        'Police report regarding disaster damage or loss',
        'Examination details: Year of exam, index number (angka giliran), school name',
        'Completed reprint application form (online via e-Lembaga Peperiksaan for SPM)',
      ],
      ms: [
        'Salinan MyKad / Slip gantian MyKad',
        'Laporan polis mengenai kerosakan atau kehilangan dalam bencana',
        'Maklumat peperiksaan: Tahun peperiksaan, angka giliran, nama sekolah/pusat',
        'Borang permohonan cetakan semula (secara dalam talian melalui portal e-Lembaga Peperiksaan untuk SPM)',
      ],
    },
    procedure: {
      en: [
        'For SPM/STAM: Visit the e-Lembaga Peperiksaan portal (https://elpp.moe.gov.my) or visit LPM Putrajaya.',
        'For STPM: Apply via the Malaysian Examinations Council (MPM) portal at https://www.mpm.edu.my.',
        'For University/College degrees: Contact your institution Registrar / Academic Affairs Division.',
        'Submit your MyKad number, exam year, and attach the disaster police report.',
        'Pay the certificate reprint fee online or at the counter.',
        'Choose delivery via registered POS Laju or in-person collection at the counter.',
      ],
      ms: [
        'Untuk SPM/STAM: Layari portal e-Lembaga Peperiksaan (https://elpp.moe.gov.my) atau hadir ke kaunter LPM Putrajaya.',
        'Untuk STPM: Mohon melalui portal Majlis Peperiksaan Malaysia (MPM) di https://www.mpm.edu.my.',
        'Untuk Ijazah/Diploma Universiti: Hubungi Pejabat Pendaftar atau Bahagian Hal Ehwal Akademik IPT masing-masing.',
        'Kemukakan nombor MyKad, tahun peperiksaan dan lampirkan laporan polis bencana.',
        'Jelaskan bayaran cetakan semula secara dalam talian atau di kaunter.',
        'Pilih penghantaran melalui Pos Laju atau pengambilan sendiri di kaunter.',
      ],
    },
    fee: {
      en: 'SPM certificate reprint: RM30.00 (plus RM10-RM15 courier fee). STPM reprint: RM50.00. University reprints vary by institution (typically RM50 - RM150).',
      ms: 'Cetakan semula sijil SPM: RM30.00 (tambah RM10-RM15 kurier). Sijil STPM: RM50.00. Ijazah universiti berbeza mengikut IPT (biasanya RM50 - RM150).',
    },
    processingTime: {
      en: '1 working day if applied in-person at LPM Putrajaya counter; 7-14 working days via online postal delivery.',
      ms: '1 hari bekerja jika memohon di kaunter LPM Putrajaya; 7-14 hari bekerja melalui pos dalam talian.',
    },
    applicationLink: 'https://elpp.moe.gov.my',
    notes: {
      en: 'If you forgot your index number (angka giliran), LPM can search using your MyKad number and birth year.',
      ms: 'Jika anda terlupa angka giliran peperiksaan, LPM boleh membuat carian menggunakan nombor MyKad dan tahun kelahiran.',
    },
    aiPromptHints: [
      'Remind user of the e-Lembaga Peperiksaan online portal (elpp.moe.gov.my)',
      'University degrees require contacting the specific university academic registry',
    ],
  },
};

export function getDocumentInfo(type: DocumentType): DocumentInfo {
  return knowledgeBase[type];
}

export const OFFICIAL_AUTHORITIES = [
  {
    name: 'Jabatan Pendaftaran Negara (JPN)',
    abbr: 'JPN',
    phone: '03-8000 8000',
    website: 'https://www.jpn.gov.my',
    services: ['MyKad', 'Birth Certificate', 'Marriage / Death Records'],
  },
  {
    name: 'Jabatan Imigresen Malaysia (JIM)',
    abbr: 'JIM',
    phone: '03-8000 8000',
    website: 'https://www.imi.gov.my',
    services: ['Malaysian International Passport', 'Visas', 'Travel Documents'],
  },
  {
    name: 'Jabatan Pengangkutan Jalan (JPJ)',
    abbr: 'JPJ',
    phone: '1-800-88-8664 / 03-8000 8000',
    website: 'https://www.jpj.gov.my',
    services: ['Driving Licence (LMM)', 'Vehicle Ownership Certificate (VOC/Geran)'],
  },
  {
    name: 'Lembaga Peperiksaan Malaysia (LPM)',
    abbr: 'LPM',
    phone: '03-8884 3785',
    website: 'https://elpp.moe.gov.my',
    services: ['SPM / STAM / UPSR Examination Certificates'],
  },
  {
    name: 'Agensi Pengurusan Bencana Negara (NADMA)',
    abbr: 'NADMA',
    phone: '03-8870 4800',
    website: 'https://www.nadma.gov.my',
    services: ['Disaster Relief Management', 'Victim Verification', 'Fee Exemption Coordination'],
  },
];

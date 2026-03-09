/**
 * Internationalization (i18n) configuration and utilities.
 * Supports English and French for ECOWAS applicants.
 */

export type Locale = 'en' | 'fr';

export const locales: Locale[] = ['en', 'fr'];

export const localeNames: Record<Locale, string> = {
  en: 'English',
  fr: 'Français',
};

export const localeFlags: Record<Locale, string> = {
  en: '🇬🇧',
  fr: '🇫🇷',
};

/**
 * Get the current locale from localStorage or default to English.
 */
export function getCurrentLocale(): Locale {
  if (typeof window === 'undefined') return 'en';

  const stored = localStorage.getItem('locale');
  if (stored && locales.includes(stored as Locale)) {
    return stored as Locale;
  }

  return 'en';
}

/**
 * Set the current locale and persist to localStorage.
 */
export function setCurrentLocale(locale: Locale): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('locale', locale);
  window.dispatchEvent(new Event('localechange'));
}

/**
 * Translation function - gets translated text for the current locale.
 */
export function t(key: string, locale?: Locale): string {
  const currentLocale = locale || getCurrentLocale();
  const translation = translations[currentLocale]?.[key];

  if (!translation) {
    console.warn(`Missing translation for key: ${key} in locale: ${currentLocale}`);
    return translations['en']?.[key] || key;
  }

  return translation;
}

/**
 * Translation dictionaries for each supported locale.
 */
export const translations: Record<Locale, Record<string, string>> = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.visa_types': 'Visa Types',
    'nav.how_it_works': 'How It Works',
    'nav.requirements': 'Requirements',
    'nav.track_status': 'Track Status',
    'nav.sign_in': 'Sign In',
    'nav.apply_now': 'Apply Now',

    // Application Steps
    'step.visa_channel': 'Visa Channel',
    'step.visa_type': 'Visa Type',
    'step.applicant_details': 'Applicant Details',
    'step.travel_details': 'Travel Details',
    'step.documents': 'Documents',
    'step.health_declaration': 'Health Declaration',
    'step.security_declaration': 'Security Declaration',
    'step.review_pay': 'Review & Pay',

    // Visa Channels
    'channel.evisa': 'E-Visa',
    'channel.evisa_desc': 'Apply online from anywhere in the world. Fastest processing with digital document submission and real-time status tracking.',
    'channel.regular': 'Regular Visa',
    'channel.regular_desc': 'Apply through a Ghana embassy or consulate nearest to you. Includes in-person document verification and biometric capture.',
    'channel.fastest_processing': 'Fastest Processing',
    'channel.apply_anywhere': 'Apply Anywhere',
    'channel.in_person': 'In-Person Verification',
    'channel.embassy_required': 'Embassy Visit Required',

    // Form Labels
    'form.surname': 'Surname',
    'form.first_name': 'First Name',
    'form.other_names': 'Other Names',
    'form.gender': 'Gender',
    'form.male': 'Male',
    'form.female': 'Female',
    'form.date_of_birth': 'Date of Birth',
    'form.country_of_birth': 'Country of Birth',
    'form.nationality': 'Nationality',
    'form.passport_number': 'Passport Number',
    'form.passport_issue_date': 'Issue Date',
    'form.passport_expiry': 'Expiry Date',
    'form.marital_status': 'Marital Status',
    'form.single': 'Single',
    'form.married': 'Married',
    'form.divorced': 'Divorced',
    'form.widowed': 'Widowed',
    'form.profession': 'Profession / Occupation',
    'form.email': 'Email Address',
    'form.phone': 'Phone Number',
    'form.intended_arrival': 'Intended Arrival Date',
    'form.duration_days': 'Duration of Stay (Days)',
    'form.purpose_of_visit': 'Purpose of Visit',

    // Entry Types
    'entry.single': 'Single Entry',
    'entry.single_desc': 'One-time entry into Ghana',
    'entry.multiple': 'Multiple Entry',
    'entry.multiple_desc': 'Multiple entries during visa validity',

    // Processing Tiers
    'tier.standard': 'Standard',
    'tier.standard_desc': '3-5 business days',
    'tier.fast_track': 'Fast-Track',
    'tier.fast_track_desc': '1-2 business days',
    'tier.express': 'Express',
    'tier.express_desc': 'Same day processing',
    'tier.ultra_express': 'Ultra-Express',
    'tier.ultra_express_desc': 'Within 4 hours',

    // Documents
    'doc.passport_bio': 'Passport Bio-data Page',
    'doc.passport_photo': 'Passport Sized Photograph',
    'doc.proof_accommodation': 'Proof of Accommodation',
    'doc.return_ticket': 'Return Flight Ticket',
    'doc.travel_insurance': 'Travel Insurance',
    'doc.yellow_fever': 'Yellow Fever Certificate',
    'doc.upload': 'Upload Document',
    'doc.uploaded': 'Uploaded',
    'doc.required': 'Required',
    'doc.optional': 'Optional',

    // OCR
    'ocr.extract_data': 'Extract Data from Passport',
    'ocr.extracting': 'Extracting passport data...',
    'ocr.success': 'Passport data extracted successfully',
    'ocr.verify': 'Please verify all extracted information',
    'ocr.confidence': 'Confidence',
    'ocr.failed': 'Failed to extract data. Please enter manually.',

    // Preview
    'preview.title': 'Application Preview',
    'preview.review': 'Review your application before submission',
    'preview.download_pdf': 'Download PDF',
    'preview.personal_info': 'Personal Information',
    'preview.passport_info': 'Passport Information',
    'preview.visa_info': 'Visa Information',
    'preview.travel_info': 'Travel Information',
    'preview.documents': 'Documents',
    'preview.fees': 'Fees',

    // Buttons
    'btn.next': 'Next',
    'btn.previous': 'Previous',
    'btn.submit': 'Submit',
    'btn.save_exit': 'Save & Exit',
    'btn.proceed_payment': 'Proceed to Payment',
    'btn.cancel': 'Cancel',
    'btn.close': 'Close',

    // Messages
    'msg.draft_saved': 'Application saved! You can continue anytime from your dashboard.',
    'msg.payment_demo': 'This is for demo purposes only - no actual payment was processed',
    'msg.required_fields': 'Please fill in all required fields',
    'msg.upload_required': 'Please upload all required documents',
  },

  fr: {
    // Navigation
    'nav.home': 'Accueil',
    'nav.visa_types': 'Types de Visa',
    'nav.how_it_works': 'Comment ça Marche',
    'nav.requirements': 'Exigences',
    'nav.track_status': 'Suivre le Statut',
    'nav.sign_in': 'Se Connecter',
    'nav.apply_now': 'Postuler Maintenant',

    // Application Steps
    'step.visa_channel': 'Canal de Visa',
    'step.visa_type': 'Type de Visa',
    'step.applicant_details': 'Détails du Demandeur',
    'step.travel_details': 'Détails du Voyage',
    'step.documents': 'Documents',
    'step.health_declaration': 'Déclaration de Santé',
    'step.security_declaration': 'Déclaration de Sécurité',
    'step.review_pay': 'Réviser et Payer',

    // Visa Channels
    'channel.evisa': 'E-Visa',
    'channel.evisa_desc': 'Postulez en ligne de n\'importe où dans le monde. Traitement le plus rapide avec soumission de documents numériques et suivi en temps réel.',
    'channel.regular': 'Visa Régulier',
    'channel.regular_desc': 'Postulez via une ambassade ou un consulat du Ghana près de chez vous. Comprend la vérification des documents en personne et la capture biométrique.',
    'channel.fastest_processing': 'Traitement le Plus Rapide',
    'channel.apply_anywhere': 'Postuler de Partout',
    'channel.in_person': 'Vérification en Personne',
    'channel.embassy_required': 'Visite à l\'Ambassade Requise',

    // Form Labels
    'form.surname': 'Nom de Famille',
    'form.first_name': 'Prénom',
    'form.other_names': 'Autres Prénoms',
    'form.gender': 'Sexe',
    'form.male': 'Masculin',
    'form.female': 'Féminin',
    'form.date_of_birth': 'Date de Naissance',
    'form.country_of_birth': 'Pays de Naissance',
    'form.nationality': 'Nationalité',
    'form.passport_number': 'Numéro de Passeport',
    'form.passport_issue_date': 'Date de Délivrance',
    'form.passport_expiry': 'Date d\'Expiration',
    'form.marital_status': 'État Civil',
    'form.single': 'Célibataire',
    'form.married': 'Marié(e)',
    'form.divorced': 'Divorcé(e)',
    'form.widowed': 'Veuf/Veuve',
    'form.profession': 'Profession / Occupation',
    'form.email': 'Adresse Email',
    'form.phone': 'Numéro de Téléphone',
    'form.intended_arrival': 'Date d\'Arrivée Prévue',
    'form.duration_days': 'Durée du Séjour (Jours)',
    'form.purpose_of_visit': 'Objet de la Visite',

    // Entry Types
    'entry.single': 'Entrée Simple',
    'entry.single_desc': 'Une seule entrée au Ghana',
    'entry.multiple': 'Entrées Multiples',
    'entry.multiple_desc': 'Entrées multiples pendant la validité du visa',

    // Processing Tiers
    'tier.standard': 'Standard',
    'tier.standard_desc': '3-5 jours ouvrables',
    'tier.fast_track': 'Rapide',
    'tier.fast_track_desc': '1-2 jours ouvrables',
    'tier.express': 'Express',
    'tier.express_desc': 'Traitement le jour même',
    'tier.ultra_express': 'Ultra-Express',
    'tier.ultra_express_desc': 'Dans les 4 heures',

    // Documents
    'doc.passport_bio': 'Page Bio-données du Passeport',
    'doc.passport_photo': 'Photo d\'Identité',
    'doc.proof_accommodation': 'Preuve d\'Hébergement',
    'doc.return_ticket': 'Billet de Retour',
    'doc.travel_insurance': 'Assurance Voyage',
    'doc.yellow_fever': 'Certificat de Fièvre Jaune',
    'doc.upload': 'Télécharger le Document',
    'doc.uploaded': 'Téléchargé',
    'doc.required': 'Requis',
    'doc.optional': 'Optionnel',

    // OCR
    'ocr.extract_data': 'Extraire les Données du Passeport',
    'ocr.extracting': 'Extraction des données du passeport...',
    'ocr.success': 'Données du passeport extraites avec succès',
    'ocr.verify': 'Veuillez vérifier toutes les informations extraites',
    'ocr.confidence': 'Confiance',
    'ocr.failed': 'Échec de l\'extraction des données. Veuillez saisir manuellement.',

    // Preview
    'preview.title': 'Aperçu de la Demande',
    'preview.review': 'Révisez votre demande avant la soumission',
    'preview.download_pdf': 'Télécharger le PDF',
    'preview.personal_info': 'Informations Personnelles',
    'preview.passport_info': 'Informations du Passeport',
    'preview.visa_info': 'Informations du Visa',
    'preview.travel_info': 'Informations de Voyage',
    'preview.documents': 'Documents',
    'preview.fees': 'Frais',

    // Buttons
    'btn.next': 'Suivant',
    'btn.previous': 'Précédent',
    'btn.submit': 'Soumettre',
    'btn.save_exit': 'Sauvegarder et Quitter',
    'btn.proceed_payment': 'Procéder au Paiement',
    'btn.cancel': 'Annuler',
    'btn.close': 'Fermer',

    // Messages
    'msg.draft_saved': 'Demande sauvegardée! Vous pouvez continuer à tout moment depuis votre tableau de bord.',
    'msg.payment_demo': 'Ceci est à des fins de démonstration uniquement - aucun paiement réel n\'a été traité',
    'msg.required_fields': 'Veuillez remplir tous les champs obligatoires',
    'msg.upload_required': 'Veuillez télécharger tous les documents requis',
  },
};

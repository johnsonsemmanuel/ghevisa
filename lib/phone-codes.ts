export interface CountryPhoneCode {
  code: string;
  name: string;
  dialCode: string;
  format?: string;
  maxLength?: number;
}

export const phoneCountries: CountryPhoneCode[] = [
  { code: "GH", name: "Ghana", dialCode: "+233", format: "### ### ####", maxLength: 9 },
  { code: "US", name: "United States", dialCode: "+1", format: "(###) ###-####", maxLength: 10 },
  { code: "GB", name: "United Kingdom", dialCode: "+44", format: "#### ### ####", maxLength: 10 },
  { code: "CA", name: "Canada", dialCode: "+1", format: "(###) ###-####", maxLength: 10 },
  { code: "NG", name: "Nigeria", dialCode: "+234", format: "### ### ####", maxLength: 10 },
  { code: "ZA", name: "South Africa", dialCode: "+27", format: "## ### ####", maxLength: 9 },
  { code: "KE", name: "Kenya", dialCode: "+254", format: "### ######", maxLength: 9 },
  { code: "UG", name: "Uganda", dialCode: "+256", format: "### ######", maxLength: 9 },
  { code: "TZ", name: "Tanzania", dialCode: "+255", format: "### ### ###", maxLength: 9 },
  { code: "ET", name: "Ethiopia", dialCode: "+251", format: "## ### ####", maxLength: 9 },
  { code: "EG", name: "Egypt", dialCode: "+20", format: "### ### ####", maxLength: 10 },
  { code: "MA", name: "Morocco", dialCode: "+212", format: "###-######", maxLength: 9 },
  { code: "DZ", name: "Algeria", dialCode: "+213", format: "### ## ## ##", maxLength: 9 },
  { code: "TN", name: "Tunisia", dialCode: "+216", format: "## ### ###", maxLength: 8 },
  { code: "SN", name: "Senegal", dialCode: "+221", format: "## ### ## ##", maxLength: 9 },
  { code: "CI", name: "Côte d'Ivoire", dialCode: "+225", format: "## ## ## ##", maxLength: 8 },
  { code: "CM", name: "Cameroon", dialCode: "+237", format: "# ## ## ## ##", maxLength: 9 },
  { code: "BJ", name: "Benin", dialCode: "+229", format: "## ## ## ##", maxLength: 8 },
  { code: "BF", name: "Burkina Faso", dialCode: "+226", format: "## ## ## ##", maxLength: 8 },
  { code: "TG", name: "Togo", dialCode: "+228", format: "## ## ## ##", maxLength: 8 },
  { code: "ML", name: "Mali", dialCode: "+223", format: "## ## ## ##", maxLength: 8 },
  { code: "NE", name: "Niger", dialCode: "+227", format: "## ## ## ##", maxLength: 8 },
  { code: "RW", name: "Rwanda", dialCode: "+250", format: "### ### ###", maxLength: 9 },
  { code: "ZM", name: "Zambia", dialCode: "+260", format: "## ### ####", maxLength: 9 },
  { code: "ZW", name: "Zimbabwe", dialCode: "+263", format: "## ### ####", maxLength: 9 },
  { code: "BW", name: "Botswana", dialCode: "+267", format: "## ### ###", maxLength: 7 },
  { code: "MZ", name: "Mozambique", dialCode: "+258", format: "## ### ####", maxLength: 9 },
  { code: "AO", name: "Angola", dialCode: "+244", format: "### ### ###", maxLength: 9 },
  { code: "IN", name: "India", dialCode: "+91", format: "##### #####", maxLength: 10 },
  { code: "CN", name: "China", dialCode: "+86", format: "### #### ####", maxLength: 11 },
  { code: "JP", name: "Japan", dialCode: "+81", format: "##-####-####", maxLength: 10 },
  { code: "KR", name: "South Korea", dialCode: "+82", format: "##-####-####", maxLength: 10 },
  { code: "AU", name: "Australia", dialCode: "+61", format: "### ### ###", maxLength: 9 },
  { code: "NZ", name: "New Zealand", dialCode: "+64", format: "##-###-####", maxLength: 9 },
  { code: "FR", name: "France", dialCode: "+33", format: "# ## ## ## ##", maxLength: 9 },
  { code: "DE", name: "Germany", dialCode: "+49", format: "### #######", maxLength: 10 },
  { code: "IT", name: "Italy", dialCode: "+39", format: "### ### ####", maxLength: 10 },
  { code: "ES", name: "Spain", dialCode: "+34", format: "### ### ###", maxLength: 9 },
  { code: "PT", name: "Portugal", dialCode: "+351", format: "### ### ###", maxLength: 9 },
  { code: "NL", name: "Netherlands", dialCode: "+31", format: "## ########", maxLength: 9 },
  { code: "BE", name: "Belgium", dialCode: "+32", format: "### ## ## ##", maxLength: 9 },
  { code: "CH", name: "Switzerland", dialCode: "+41", format: "## ### ## ##", maxLength: 9 },
  { code: "SE", name: "Sweden", dialCode: "+46", format: "##-### ## ##", maxLength: 9 },
  { code: "NO", name: "Norway", dialCode: "+47", format: "### ## ###", maxLength: 8 },
  { code: "DK", name: "Denmark", dialCode: "+45", format: "## ## ## ##", maxLength: 8 },
  { code: "FI", name: "Finland", dialCode: "+358", format: "## ### ####", maxLength: 9 },
  { code: "PL", name: "Poland", dialCode: "+48", format: "### ### ###", maxLength: 9 },
  { code: "RU", name: "Russia", dialCode: "+7", format: "(###) ###-##-##", maxLength: 10 },
  { code: "TR", name: "Turkey", dialCode: "+90", format: "### ### ####", maxLength: 10 },
  { code: "SA", name: "Saudi Arabia", dialCode: "+966", format: "## ### ####", maxLength: 9 },
  { code: "AE", name: "United Arab Emirates", dialCode: "+971", format: "## ### ####", maxLength: 9 },
  { code: "BR", name: "Brazil", dialCode: "+55", format: "## #####-####", maxLength: 11 },
  { code: "MX", name: "Mexico", dialCode: "+52", format: "### ### ####", maxLength: 10 },
  { code: "AR", name: "Argentina", dialCode: "+54", format: "## ####-####", maxLength: 10 },
  { code: "SG", name: "Singapore", dialCode: "+65", format: "#### ####", maxLength: 8 },
  { code: "MY", name: "Malaysia", dialCode: "+60", format: "##-### ####", maxLength: 9 },
  { code: "TH", name: "Thailand", dialCode: "+66", format: "## ### ####", maxLength: 9 },
  { code: "PH", name: "Philippines", dialCode: "+63", format: "### ### ####", maxLength: 10 },
  { code: "ID", name: "Indonesia", dialCode: "+62", format: "###-###-####", maxLength: 10 },
  { code: "VN", name: "Vietnam", dialCode: "+84", format: "## ### ####", maxLength: 9 },
  { code: "PK", name: "Pakistan", dialCode: "+92", format: "### #######", maxLength: 10 },
  { code: "BD", name: "Bangladesh", dialCode: "+880", format: "####-######", maxLength: 10 },
];

export function getCountryByCode(code: string): CountryPhoneCode | undefined {
  return phoneCountries.find(c => c.code === code);
}

export function formatPhoneNumber(phone: string, format?: string): string {
  if (!format) return phone;
  
  const digits = phone.replace(/\D/g, "");
  let formatted = "";
  let digitIndex = 0;
  
  for (let i = 0; i < format.length && digitIndex < digits.length; i++) {
    if (format[i] === "#") {
      formatted += digits[digitIndex];
      digitIndex++;
    } else {
      formatted += format[i];
    }
  }
  
  return formatted;
}

export function validatePhoneNumber(phone: string, maxLength?: number): boolean {
  const digits = phone.replace(/\D/g, "");
  if (!maxLength) return digits.length >= 7 && digits.length <= 15;
  return digits.length === maxLength;
}

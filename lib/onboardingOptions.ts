export const RELIGION_OPTIONS = ["Islam", "Christianity", "Hinduism", "Other"];
export const SECT_OPTIONS = ["Sunni", "Shia", "Other / prefer not to say"];
export const PRACTICE_LEVEL_OPTIONS = ["Very practicing", "Practicing", "Moderately practicing", "Learning"];
export const MARITAL_STATUS_OPTIONS = ["Never married", "Divorced", "Widowed", "Annulled"];
export const WANTS_CHILDREN_OPTIONS = ["Yes", "No", "Open to it", "Have children, want more", "Have children, content"];
export const RELOCATE_OPTIONS = ["Yes", "No", "Open to discussion"];
export const EDUCATION_OPTIONS = ["High school", "Bachelor's", "Master's", "Doctorate", "Trade / vocational"];
export const SMOKING_OPTIONS = ["Non-smoker", "Occasional", "Regular smoker"];
export const LANGUAGE_OPTIONS = ["Urdu", "English", "Punjabi", "Pashto", "Sindhi", "Balochi", "Arabic", "Other"];

export const PREFERENCE_FIELDS: { field: string; label: string; options: string[] }[] = [
  { field: "religion", label: "Religion", options: RELIGION_OPTIONS },
  { field: "sect", label: "Sect / maslak", options: SECT_OPTIONS },
  { field: "marital_status", label: "Marital status", options: MARITAL_STATUS_OPTIONS },
  { field: "wants_children", label: "Wants children", options: WANTS_CHILDREN_OPTIONS },
  { field: "relocate", label: "Willing to relocate", options: RELOCATE_OPTIONS },
  { field: "education", label: "Education", options: EDUCATION_OPTIONS },
  { field: "smoking", label: "Smoking", options: SMOKING_OPTIONS },
];

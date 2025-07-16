import selectOptions from "./selectOptions";

const normalizeUserData = (data) => {
  // Helper for select fields
  const normalize = (val, options) => {
    if (val === undefined || val === null) return "";
    // Try to match by value (case-insensitive)
    const found = options.find(
      (opt) => String(opt.value).toLowerCase() === String(val).toLowerCase()
    );
    if (found) return found.value;
    // Try to match by label (case-insensitive)
    const foundByLabel = options.find(
      (opt) => String(opt.label).toLowerCase() === String(val).toLowerCase()
    );
    if (foundByLabel) return foundByLabel.value;
    // Special case for mangalik (e.g. "Non manglik" -> "non_manglik")
    if (options === selectOptions.mangalik && typeof val === "string") {
      if (val.toLowerCase().includes("non")) return "non_manglik";
      if (val.toLowerCase().includes("partial")) return "partial_manglik";
      if (val.toLowerCase().includes("manglik")) return "manglik";
    }
    // For booleans
    if (typeof val === "boolean") return val ? "true" : "false";
    return "";
  };

  return {
    user: {
      name: data.name || "",
      email: data.email || "",
      mobile: data.mobile || "",
      gender: normalize(data.gender, selectOptions.gender),
      dob: data.dob || "",
      religion: normalize(data.religion, selectOptions.religion),
      marital_status: normalize(
        data.marital_status,
        selectOptions.marital_status
      ),
      height: data.height || "",
      caste: normalize(data.caste, selectOptions.caste),
      language: data.language || "",
      hobbies: Array.isArray(data.hobbies)
        ? data.hobbies.join(", ")
        : data.hobbies || "",
      mangalik: normalize(data.mangalik, selectOptions.mangalik),
      birth_details: data.birth_details || { birth_time: "", birth_place: "" },
      physical_attributes: {
        skin_tone: normalize(
          data.physical_attributes?.skin_tone,
          selectOptions.skin_tone
        ),
        body_type: normalize(
          data.physical_attributes?.body_type,
          selectOptions.body_type
        ),
        physical_disability: normalize(
          data.physical_attributes?.physical_disability,
          selectOptions.physical_disability
        ),
        disability_reason: data.physical_attributes?.disability_reason || "",
      },
      lifestyle: {
        smoke: normalize(data.lifestyle?.smoke, selectOptions.smoke),
        drink: normalize(data.lifestyle?.drink, selectOptions.drink),
        veg_nonveg: normalize(
          data.lifestyle?.veg_nonveg,
          selectOptions.veg_nonveg
        ),
        nri_status: normalize(
          data.lifestyle?.nri_status,
          selectOptions.nri_status
        ),
      },
      location: data.location || { city: "", address: "" },
      profile_pictures: data.profile_pictures || [],
    },
    astrology: {
      rashi_nakshatra: data.astrology?.rashi_nakshatra || "",
      gotra: data.astrology?.gotra || "",
    },
    education: {
      education_level: normalize(
        data.education?.education_level,
        selectOptions.education_level
      ),
      education_field: normalize(
        data.education?.education_field,
        selectOptions.education_field
      ),
      school_details: data.education?.school_details || { name: "", city: "" },
      college_details: data.education?.college_details || {
        name: "",
        city: "",
        passout_year: "",
      },
    },
    family: {
      family_value: normalize(
        data.family?.family_value,
        selectOptions.family_value
      ),
      family_type: normalize(
        data.family?.family_type,
        selectOptions.family_type
      ),
      mother: data.family?.mother || { name: "", occupation: "" },
      father: data.family?.father || { name: "", occupation: "" },
      siblings: data.family?.siblings || { brother_count: 0, sister_count: 0 },
    },
    profession: {
      occupation: data.profession?.occupation || "",
      work_address: data.profession?.work_address || { address: "", city: "" },
    },
  };
};

export default normalizeUserData;

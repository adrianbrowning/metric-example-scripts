const {
        reportHandler,
        constants: {DATABASE_TYPES},
        utils: {isEmpty}
      } = require("magic-metrics-tool");

reportHandler({
  logName : "cm_in_use_report",
  checkProfile : checkProfile,
  dbDataTypes : {
    explicitConfigured: DATABASE_TYPES.TEXT,
    explicitEnabled: DATABASE_TYPES.TEXT,
    preferencesConfigured: DATABASE_TYPES.TEXT,
    preferencesEnabled: DATABASE_TYPES.TEXT,
    ccpaConfigured: DATABASE_TYPES.TEXT,
    ccpaEnabled: DATABASE_TYPES.TEXT,
    usingV2: DATABASE_TYPES.TEXT
  }
});

async function checkProfile(
  { record, account, profile, profileData, resolve, reject }){
  try {

    if (isEmpty(profileData))  return void resolve();
    if (isEmpty(profileData.privacy_management))  return void resolve();

      record({
        account,
        profile,
        explicitConfigured : String(!!profileData.privacy_management.explicit),
        explicitEnabled : String(!!profileData.privacy_management.explicit && profileData.privacy_management.explicit.isEnabled == "true"),
        preferencesConfigured : String(!!profileData.privacy_management.preferences),
        preferencesEnabled : String(!!profileData.privacy_management.preferences && profileData.privacy_management.preferences.isEnabled == "true"),
        ccpaConfigured : String(!!profileData.privacy_management.doNotSell),
        ccpaEnabled : String(!!profileData.privacy_management.doNotSell && profileData.privacy_management.doNotSell.isEnabled == "true"),
        usingV2: String(profileData.privacy_management.useTemplate === "true")
      });
    resolve();
  }
  catch (e) {
    return reject(e);
  }
}


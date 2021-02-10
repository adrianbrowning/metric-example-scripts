const {
        reportHandler,
        constants: {DATABASE_TYPES},
        utils: {isEmpty}
      } = require("magic-metrics-tool");
const _ = require("underscore");

reportHandler({
  logName : "consent_categories",
  useLocal : true,
  dropDB : true,
  checkProfile : profileChecker,
  dbDataTypes : {
    "enabled" : DATABASE_TYPES.TEXT,
    "mobile" : DATABASE_TYPES.TEXT,
    "misc" : DATABASE_TYPES.TEXT,
    "personalization" : DATABASE_TYPES.TEXT,
    "display_ads" : DATABASE_TYPES.TEXT,
    "social" : DATABASE_TYPES.TEXT,
    "email" : DATABASE_TYPES.TEXT,
    "engagement" : DATABASE_TYPES.TEXT,
    "affiliates" : DATABASE_TYPES.TEXT,
    "cdp" : DATABASE_TYPES.TEXT,
    "monitoring" : DATABASE_TYPES.TEXT,
    "analytics" : DATABASE_TYPES.TEXT,
    "crm" : DATABASE_TYPES.TEXT,
    "cookiematch" : DATABASE_TYPES.TEXT,
    "big_data" : DATABASE_TYPES.TEXT,
    "search" : DATABASE_TYPES.TEXT,
    "mobile_enabled" : DATABASE_TYPES.TEXT,
    "misc_enabled" : DATABASE_TYPES.TEXT,
    "personalization_enabled" : DATABASE_TYPES.TEXT,
    "display_ads_enabled" : DATABASE_TYPES.TEXT,
    "social_enabled" : DATABASE_TYPES.TEXT,
    "email_enabled" : DATABASE_TYPES.TEXT,
    "engagement_enabled" : DATABASE_TYPES.TEXT,
    "affiliates_enabled" : DATABASE_TYPES.TEXT,
    "cdp_enabled" : DATABASE_TYPES.TEXT,
    "monitoring_enabled" : DATABASE_TYPES.TEXT,
    "analytics_enabled" : DATABASE_TYPES.TEXT,
    "crm_enabled" : DATABASE_TYPES.TEXT,
    "cookiematch_enabled" : DATABASE_TYPES.TEXT,
    "big_data_enabled" : DATABASE_TYPES.TEXT,
    "search_enabled" : DATABASE_TYPES.TEXT,
    collect: DATABASE_TYPES.TEXT
  }
});

async function profileChecker( { record, account, profile, profileData, resolve, reject }){
  try {

    if (isEmpty(profileData)) return resolve();
    if (isEmpty(profileData.privacy_management)) return resolve();
    if (isEmpty(profileData.privacy_management.preferences)) return resolve();

    const pref = profileData.privacy_management.preferences;
    const language = pref.languages.en && pref.languages.en.categories || {
      "affiliates": "",
      "analytics": "",
      "big_data": "",
      "cdp": "",
      "cookiematch": "",
      "crm": "",
      "display_ads": "",
      "email": "",
      "engagement": "",
      "misc": "",
      "mobile": "",
      "monitoring": "",
      "personalization": "",
      "search": "",
      "social": ""
    };


    record({
      account,
      profile,
      enabled: String(pref.isEnabled),
      "affiliates":language["affiliates"].name,
      "analytics":language["analytics"].name,
      "big_data":language["big_data"].name,
      "cdp":language["cdp"].name,
      "cookiematch":language["cookiematch"].name,
      "crm":language["crm"].name,
      "display_ads":language["display_ads"].name,
      "email":language["email"].name,
      "engagement":language["engagement"].name,
      "misc":language["misc"].name,
      "mobile":language["mobile"].name,
      "monitoring":language["monitoring"].name,
      "personalization":language["personalization"].name,
      "search":language["search"].name,
      "social":language["social"].name,

      "affiliates_enabled":pref.categories["affiliates"].enabled,
      "analytics_enabled":pref.categories["analytics"].enabled,
      "big_data_enabled":pref.categories["big_data"].enabled,
      "cdp_enabled":pref.categories["cdp"].enabled,
      "cookiematch_enabled":pref.categories["cookiematch"].enabled,
      "crm_enabled":pref.categories["crm"].enabled,
      "display_ads_enabled":pref.categories["display_ads"].enabled,
      "email_enabled":pref.categories["email"].enabled,
      "engagement_enabled":pref.categories["engagement"].enabled,
      "misc_enabled":pref.categories["misc"].enabled,
      "mobile_enabled":pref.categories["mobile"].enabled,
      "monitoring_enabled":pref.categories["monitoring"].enabled,
      "personalization_enabled":pref.categories["personalization"].enabled,
      "search_enabled":pref.categories["search"].enabled,
      "social_enabled":pref.categories["social"].enabled,
      collect: String(_.where(profileData.manage, {tag_id: "20064", status: "active"}).length > 0)
    });
    resolve();

  }
  catch (e) {
    return reject(e);
  }
}




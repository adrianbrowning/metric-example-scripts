const {
        reportHandler,
        constants: {DATABASE_TYPES},
        utils: {isEmpty, date}
      } = require("magic-metrics-tool");
const _ = require("underscore");

const profileChecker = async function checkProfile(
  { iQ, record, account, profile, resolve, reject }){
  try {

    const getProfiles = await iQ.getProfiles(account);

    const allProfiles = await iQ.getAllProfileDetails(account);

    const sorted_get_profiles = getProfiles.profiles.sort();
    const sorted_all_profiles = _.pluck(allProfiles.profiles, "name").sort();


    const missing_from_get_profiles = _.difference(sorted_get_profiles, sorted_all_profiles);
    const missing_from_all_profiles = _.difference(sorted_all_profiles,sorted_get_profiles);

    // if (missing_from_get_profiles.length ===0 && missing_from_all_profiles.length === 0) return resolve();

    record({
      account,
      profile,
      missing_from_get_profiles: missing_from_get_profiles.join("|"),
      size_missing_from_get_profiles: missing_from_get_profiles.length,
      missing_from_all_profiles: missing_from_all_profiles.join("|"),
      size_missing_from_all_profiles: missing_from_all_profiles.length,
    });
    resolve();

  }
  catch (e) {
    return reject(e);
  }
};
reportHandler({
    logName : `getProfile_vs_allProfiles_response`,
    checkProfile : profileChecker,
    dbDataTypes : {
      missing_from_get_profiles: DATABASE_TYPES.TEXT,
      missing_from_all_profiles: DATABASE_TYPES.TEXT,
      size_missing_from_get_profiles : DATABASE_TYPES.INTEGER,
      size_missing_from_all_profiles : DATABASE_TYPES.INTEGER
    }
  }
);



const {
        reportHandler,
        constants: {DATABASE_TYPES},
        utils: {isEmpty, date}
      } = require("magic-metrics-tool");
const _ = require("underscore");

const ERROR_CODE = {
  INFO: "info",
  INVALID_LIBRARY: "invalid_library",
  INVALID_ENVIRONMENT: "invalid_environment",
  NON_EXISTENT_LIBRARY: "non_existent_library",
  NON_EXISTENT_PROFILE: "non_existent_profile",
  REQUIRED_LIB_LINK: "required_lib_link",
  PROFILE_TO_LIB: "profile_to_lib",
  PROFILE_TO_LIB_ENV: "profile_to_lib_env",
  LIB_TO_PROFILE: "lib_to_profile",
  LIB_TO_PROFILE_ENV: "lib_to_profile_env",
  TOO_MANY_LINKS: "too_many_links",
  NO_PROFILES: "no_profiles",
};

const VALID_ENVS = {"Prod": true, "QA":true, "Dev": true};

// Invalid library option ✅
// Required profile linkage to ALL profiles (ignore partial linkage) ✅
// No profiles in object ✅
// X tries to import non-existent Y ✅
// Xy References Z, but doesn't reference back ✅
// Wx References Y, but doesn't reference back with same Environment Z ✅
// Invalid Environment ✅
// V [w] X [y] is listed Z times ✅


/**
 *
 * @param profiles
 * @param record {recordInfoCB}
 * @return {boolean}
 */
function validatePersistentLinkage({ profiles }, record){
  let isValid = true;

  const _profiles          = {},
        _requiredLibraries = {},
        _optionalLibraries = {};

  let _profileCount           = 0,
      _requiredLibrariesCount = 0,
      _optionalLibrariesCount = 0;

  _.forEach(profiles, function(pd){
    if (pd.library === "NONE") {
      _profiles[pd.name] = pd;
      _profileCount++;
    } else if (pd.library === "optional") {
      _optionalLibraries[pd.name] = pd;
      _optionalLibrariesCount++;
    } else if (pd.library === "required") {
      _requiredLibraries[pd.name] = pd;
      _requiredLibrariesCount++;
    } else {
      record(ERROR_CODE.INVALID_LIBRARY, `Invalid library option [${pd.name}] ${pd.library}`);
      _profiles[pd.name] = pd;
      _profileCount++;
    }
  });

  record(ERROR_CODE.INFO, `Library Count: ${_optionalLibrariesCount} | ${_requiredLibrariesCount}`);

  if (_profileCount === 0) {
    record(ERROR_CODE.NO_PROFILES, `No profiles in account all_profiles`);
  }

  _.forEach(_profiles, function(profileData, name){
    validateLinkage("Profile", name, profileData, "Library", {..._requiredLibraries, ..._optionalLibraries} );
  });

  _.forEach(_requiredLibraries, function(profileData, libName){
    _.forEach(_profiles, function(profileData, profileName){
      if (!(_.where(_profiles[profileName].imports, { name : libName }).length > 0 &&
        _.where(_requiredLibraries[libName].imports, { name : profileName }).length > 0)) {
        record(ERROR_CODE.REQUIRED_LIB_LINK, `required library [${libName}] missing link to profile [${profileName}]`);
      }
    });
    validateLinkage("Library", libName, profileData, "Profile", _profiles );
  });

  _.forEach(_optionalLibraries, function(libData, name){
    validateLinkage("Library", name, libData, "Profile", _profiles );
  });

  return isValid;

  function validateLinkage(sourceType,
                           sourceName,
                           sourceData,
                           destinationType,
                           objectsToCheck){

    if (_.isEmpty(sourceData.imports)) return;

    /**
     * @type {object}
     */
    const dupList = {};

    _.forEach(sourceData.imports, function({name, environment}){

        dupList[name] = dupList[name] || 0;
        dupList[name]++;

      if (!VALID_ENVS[environment]) {
        record(ERROR_CODE.INVALID_ENVIRONMENT,
          `${sourceType} [${sourceName}] links to import non-existent environment ${destinationType} [${name} [${environment}]]`
        );
      }


      if (!objectsToCheck[name]) {
        record(`non_existent_${destinationType}`.toLowerCase(),
          `${sourceType} [${sourceName}] tries to import non-existent ${destinationType} [${name}]`
        );
        return;
      }

      if(_.where(objectsToCheck[name].imports, { name: sourceName, environment }).length === 0) {
        record(`${sourceType}_to_${destinationType}`.toLowerCase(),
          `${sourceType} [${sourceName} [${environment}]] references ${destinationType} [${name}], but doesn't reference back`
        );
      } else {
        /**
         * @type {array}
         */
        const envCheck = _.where(objectsToCheck[name].imports, { name });
        if(envCheck.length > 0) {
          record(`${sourceType}_to_${destinationType}_env`.toLowerCase(),
            `${sourceType} [${sourceName} [${environment}]] references ${destinationType} [${name}], but doesn't reference back back with same environment [${envCheck[0].environment}]`
          );
        }
      }
    });


    _.forEach(dupList, function(count, name){
      if (count < 2) return ;
      record(ERROR_CODE.TOO_MANY_LINKS,
        `${sourceType} [${sourceName}] links to ${destinationType} [${name}] ${count} times`
      );
    });
    return isValid;
  }

}


const profileChecker = async function checkProfile(
  { iQ, record, account, resolve, reject, accountType }){
  try {

    const all_profile_data = await iQ.getAllProfileDetails(account);
    validatePersistentLinkage(all_profile_data,
      /**
       * @callback recordInfoCB
       * @param {String} errorCode
       * @param {String} msg
       */
      function(errorCode, msg){
      record({
        account,
        msg,
        profile : null,
        accountType,
        errorCode
      });
    });

    resolve();

  }
  catch (e) {
    return reject(e);
  }
};
reportHandler({
    logName : `all_profiles_validation_${date}`,
    checkProfile : profileChecker,
    dbDataTypes : {
      msg : DATABASE_TYPES.TEXT,
      accountType: DATABASE_TYPES.TEXT,
      errorCode: DATABASE_TYPES.TEXT
    },
    getProfileData : false,
    getProfiles : false,
  }
);

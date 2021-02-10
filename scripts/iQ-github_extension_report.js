const {
        reportHandler,
        constants: {DATABASE_TYPES},
      } = require("magic-metrics-tool");

const _ = require("underscore");

const profileChecker = async function checkProfile(
  { record, account, profile, profileData, resolve, reject }){
  try {

    const aJS = _.where(profileData.customizations, {id:"100040"});
    if (aJS.length === 0) {
      return void resolve();
    }

    aJS.forEach(function(ext, idx){
      const extId = aJS[idx]._id;
      if(_.isEmpty(ext.codeDevData)){
        return;
      }
      if(_.isEmpty(ext.codeDevData.draftSnippets)){
        return;
      }
      let counter = 0;
      _.forEach(ext.codeDevData.draftSnippets,function(draft){
        if (draft.versionControl) {
          counter++
        }
      });
      if (counter===0) return void resolve();

      record({
        account,
        profile,
        versionsCounter: counter,
        extId: +extId
      });
    });

    resolve();

  }
  catch (e) {
    return reject(e);
  }
};
reportHandler({
    logName : "github_version_control",
    checkProfile : profileChecker,
    dbDataTypes : {
      versionsCounter: DATABASE_TYPES.INTEGER,
      extId: DATABASE_TYPES.INTEGER
    }
  }
);



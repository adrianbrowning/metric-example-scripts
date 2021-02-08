const {
        reportHandler,
        constants: {DATABASE_TYPES},
      } = require("magic-metrics-tool");
const _ = require("underscore");


const profileChecker = async function checkProfile(
  { record, account, profile, profileData, resolve, reject }){
  try {
    const omniCount = _.size(profileData.bulk_augmentation_definitions);
    if(omniCount> 0) {

      const omniCountActive = _.where(profileData.bulk_augmentation_definitions, {enabled: true}).length;

      record({
        account,
        profile,
        info: "omni",
        total: omniCount,
        active: omniCountActive,
        inactive: omniCount - omniCountActive
      });
    }

    const fileImports = _.where(profileData.dataSources, {category: "fileImport"})

    if (fileImports.length > 0) {
      const fileImport = {active: 0, inactive: 0};
      fileImports.forEach(function(fi){
        if(_.where(profileData.fileDefinitions, {dataSourceId: fi.id})[0].enabled){
          fileImport.active++;
        } else {
          fileImport.inactive++;
        }
      });

      record({
        account,
        profile,
        info: "fileImport",
        total: fileImports.length,
        active: fileImport.active,
        inactive: fileImport.inactive
      });
    }

    resolve();

  }
  catch (e) {
    return reject(e);
  }
};
reportHandler({
    logName : "omni_vs_fileImport",
    checkProfile : profileChecker,
    dbDataTypes : {
      info: DATABASE_TYPES.TEXT,
      total: DATABASE_TYPES.INTEGER,
      active: DATABASE_TYPES.INTEGER,
      inactive: DATABASE_TYPES.INTEGER
    }
  }
);



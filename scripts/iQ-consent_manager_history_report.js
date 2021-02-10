const {
        reportHandler,
        constants: {DATABASE_TYPES},
        utils: {isEmpty}
      } = require("magic-metrics-tool");

reportHandler({
  logName : "cm_in_history_report",
  checkProfile : profileChecker,
  dbDataTypes : {
    event : DATABASE_TYPES.TEXT,
    versionId : DATABASE_TYPES.TEXT,
    revisionId : DATABASE_TYPES.TEXT,
    extra: DATABASE_TYPES.TEXT
  }
});


async function profileChecker(
  { record, account, profile, profileData, resolve, reject }){
  try {

    for (const consentHistory of getHistoryData(profileData, event => event.action.startsWith("added_consent_") || event.action.startsWith("removed_consent_"))){
      if (consentHistory.event.action.startsWith("removed_consent_")) break;
      record({
        account,
        profile,
        event : consentHistory.event.action,
        revisionId : consentHistory.revisionId,
        versionId : consentHistory.versionId,
        extra : ""
      });
      break;
    }

    for (const consentHistory of getHistoryData(profileData, event => /updated_.*?_template/.test(event.action) && event.data.id && event.data.id.startsWith("cm"))){
      record({
        account,
        profile,
        event : consentHistory.event.action,
        revisionId : consentHistory.revisionId,
        versionId : consentHistory.versionId,
        extra: consentHistory.event.data.id
      });
    }

    resolve();
  }
  catch (e) {
    return reject(e);
  }
}

function* getHistoryData(profileData, predicate){
  if (isEmpty(profileData.publish_history)) return;
  for (const versionId of Object.keys(profileData.publish_history).sort().reverse()){

    const versionObj = profileData.publish_history[versionId];

    for (const revisionId of Object.keys(versionObj).sort().reverse()){
      const revision = versionObj[revisionId];
      const revisionHistory = JSON.parse(revision.history || '[]');

      for (let i = 0; i < revisionHistory.length; i++){
        let event = revisionHistory[i];

        if (predicate(event)) {
          yield {
            event,
            revisionId,
            versionId,
            notes : revision.notes,
            operator : revision.operator,
            status : revision.status
          };
          return;
        }
      }
    }
  }
}




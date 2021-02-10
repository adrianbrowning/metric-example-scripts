const {
        reportHandler,
        constants: {DATABASE_TYPES},
      } = require("magic-metrics-tool");

const _ = require("underscore");

reportHandler({
  logName : "js_encoding_report3",
  checkProfile : profileChecker,
  dbDataTypes : {
    code: DATABASE_TYPES.TEXT
  }
});

function* getJSCode(jsExtensions){
  for (let i = 0; i < jsExtensions.length; i++){
    let dataObject = jsExtensions[i];
    if (!_.isEmpty(dataObject.codeDevData)) {
      if (!_.isEmpty(dataObject.codeDevData.draftSnippets)) {
        for (let i in dataObject.codeDevData.draftSnippets){
          yield dataObject.codeDevData.draftSnippets[i].code || "";
        }
      }
      if (_.isEmpty(dataObject.codeDevData.promotedSnippets)) {
        for (let i in dataObject.codeDevData.promotedSnippets){
          yield dataObject.codeDevData.promotedSnippets[i].code || "";
        }
      }
    } else {
      yield dataObject.code || "";
    }

  }

}

async function profileChecker(
  { record, account, profile, profileData, resolve, reject }){
  try {
    const aJS = [
      ..._.where(profileData.customizations, { id : "100040" }),
      ..._.where(profileData.customizations, { id : "100036" }),
      ..._.where(profileData.customizations, { id : "100011" })
    ];

    for (let code of getJSCode(aJS)){
      if (
        code.includes("&#x60;") ||
        code.includes("&amp;#x60;") ||
        code.includes("&amp;#x60;")
      ) {
        record({
          account,
          profile,
          code
        });
      }
    }

    resolve();
  }
  catch (e) {
    return reject(e);
  }
}


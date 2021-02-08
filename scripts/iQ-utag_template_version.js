const {
        reportHandler,
        constants: {DATABASE_TYPES},
      } = require("magic-metrics-tool");
const _ = require("underscore");


function getVersion(array){
  if (!array) return "N/A";
  for (let line of array){
    let match = line.match(/ut(\d.\d{1,4})/);
    if (match) {
      return match[1];
    }
  }
  return "N/A";
}

const profileChecker = async function checkProfile(
  { iQ, record, account, profile, profileData, resolve, reject, accountType }){
  try {

    const latestVersion = Object.keys(profileData.publish_history).sort().reverse()[0];
    const revision = Object.keys(profileData.publish_history[latestVersion]).filter(key => /\d{12}/.test(key)).sort().reverse()[0];

    var [error, templateData] = await iQ
                                         .getTemplate({
                                           account,
                                           profile,
                                           revision,
                                           template : "revision.loader"
                                         })
                                         .then(template => [null, template])
                                         .catch(e => ~e.message.indexOf("That revision details does not exist") ? [null, null] : [e, null]);

    if (_.isEmpty(templateData)) {
      [error, templateData] = await iQ
                                       .getTemplate({
                                         account,
                                         profile,
                                         revision,
                                         template : "profile.loader"
                                       })
                                           .then(template => [null, template])
                                           .catch(e => ~e.message.indexOf("That revision details does not exist") ? [null, null] : [e, null]);
    }

    if (error) return reject(error);

    let version = "N/A";

    if (templateData && templateData.content) {
      version = getVersion(templateData.content.match(/ut4.\d*/g));
    }

    record({
      account,
      profile,
      version,
      accountType
    });

    resolve();

  }
  catch (e) {
    return reject(e);
  }
};
reportHandler({
    logName : `utag_version_report`,
    checkProfile : profileChecker,
    dbDataTypes : {
      version : DATABASE_TYPES.TEXT,
      accountType : DATABASE_TYPES.TEXT
    }
  }
);



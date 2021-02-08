const reportHandler = require("./base");
const _ = require("underscore");

const fb_tags = [20010];

const getTemplates = async (tealApi, account, profile, revision, tag_id) => {
  const p1 = tealApi.iQUDHAPI.getTemplate({
    account,
    profile,
    revision,
    template : "profile." + tag_id
  }).then(r => [null, r, "profile"]).catch(e => [e, null]);
  const p2 = tealApi.iQUDHAPI.getTemplate({
    account,
    profile,
    revision,
    template : "revision." + tag_id
  }).then(r => [null, r, "version"]).catch(e => [e, null]);
  return Promise.all([p1, p2]);
};

const profileChecker = async function checkProfile(
  { tealApi, record, account, profile, profileData, resolve, reject }){
  try {

    if (_.isEmpty(profileData.manage)) {
      return void resolve();
    }

    /*
    1. Instances of the FB tag (default marketplace template)
    2. Instances of the FB tag (customized marketplace template)
    3. Instances of the FB tag through an actual Custom Container, rather than using the tag marketplace version(s)
    * */
    for (let i in fb_tags){
      const template_id = fb_tags[i];
      const results = _.where(profileData.manage, { tag_id : String(template_id) });
      if (results.length === 0) continue;
      for (let j in results){
        const results_tag_id = results[j]._id;
        const templateResponses = await getTemplates(tealApi, account, profile, profileData.settings.revision, results_tag_id);
        // console.dir(templateResponses);
        templateResponses.forEach(response => {
          if (response[0]) {
            if (response[0].returnCode === 1260) return; //"That revision details does not exist"
            throw new Error(JSON.stringify(response[0]));
          }
          if (_.isEmpty(response[1])) return;

          const content = response[1].content;

          if (content.match(/\b(fbq)\b/g)) {
            record({
              account,
              profile,
              template_id : String(template_id),
              tag_uid : results_tag_id,
              versionDate : "N/A",
              isModified : "N/A",
              isLatest: "Unknown",
              isActive: String(results[j].status === "active"),
              adv_match: "Unknown",
              type:response[2],
              title: results[j].title
            });
          }
        });

      }
    }

    resolve();

  }
  catch (e) {
    return reject(e);
  }
};
reportHandler({
  dropDB:true,
    logName : "accounts_profile-fb_tags-custom-container",
    checkProfile : profileChecker,
    dbDataTypes : {
      template_id : "TEXT",
      tag_uid : "NUMBER",
      versionDate : "TEXT",
      isModified : "TEXT",
      isLatest : "TEXT",
      isActive : "TEXT",
      adv_match: "TEXT",
      title: "TEXT",
      type:"TEXT"
    }
    // accountOvrdList : ["eng-ab"],
    // accountProfileList: [{account:"eng-ab", profile:"promisetest"}]
  }
);



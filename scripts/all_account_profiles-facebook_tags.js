const reportHandler = require("./base");
const _ = require("underscore");
const tagDataBase = require("../database.json");
const crypto = require("crypto");
const request = require("request");

const generateHash = content => crypto.createHash('md5').update(content).digest('hex');

const fb_tags = [/*6003,6011,6020,6024,*/6025, 6026 /*, 6027, 6032, 6037*/, 20010];

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

function getTemplate(account, profile, tag){
  return new Promise((resolve, reject) => {
    const url = `https://tags.tiqcdn.com/utag/${account}/${profile}/prod/utag.${tag}.js`;
    console.log("Getting:", url);
    request(`https://tags.tiqcdn.com/utag/${account}/${profile}/prod/utag.${tag}.js`, function (error, response, body) {
      if (error) return resolve(null);
      if (body === "Not found\n") return resolve(null);
      resolve(body); // Print the HTML for the Google homepage.
    });
  });
}

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
      const tagDBEntery = tagDataBase[template_id];
      const results = _.where(profileData.manage, { tag_id : String(template_id) });
      if (results.length === 0) continue;
      for (let j in results){
        const results_tag_id = results[j]._id;
        // const templateResponses = await getTemplates(tealApi, account, profile, profileData.settings.revision, results_tag_id);
        const templateResponse = await getTemplate(account,profile,results_tag_id);
        // console.dir(templateResponses);
        [templateResponse].forEach(content => {
          if (content === null) { return;}

          if (template_id == 20010) {
            if (content.match(/\b(fbq)\b/g)) {
              record({
                account,
                profile,
                template_id : String(template_id),
                tag_uid : results_tag_id,
                versionDate : "N/A",
                isModified : "N/A",
                isLatest : "Unknown",
                isActive : String(results[j].status === "active"),
                adv_match : "Unknown",
                title : results[j].title
              });
            }
          } else {
            const md5_crypto = generateHash(_.unescape(content));
            const m = content.match(/tv:(\d+).(\d+)/);
            if (!m) {
              record({
                account,
                profile,
                template_id : String(template_id),
                tag_uid : results_tag_id,
                versionDate : "N/A",
                isModified : "true",
                isLatest : "N/A",
                isActive : String(results[j].status === "active"),
                adv_match : results[j].config_adv_match || "Not Set",
                title : results[j].title
              });
              return;
            }

            const [, , ts] = m;
            let isModified = _.where(tagDBEntery.versions, { md5 : md5_crypto }).length === 0;

            // if(isModified) {
            //   console.dir(Object.values(tagDBEntery.versions).filter(a => a.extractts === ts || a.realts === ts ));
            //   debugger;
            // }
            let firstVersion = tagDBEntery.versions[0];
            record({
              account,
              profile,
              template_id : String(template_id),
              tag_uid : results_tag_id,
              versionDate : ts,
              isModified : String(isModified),
              isLatest : String(firstVersion.extractts === ts || firstVersion.realts === ts),
              isActive : String(results[j].status === "active"),
              adv_match : results[j].config_adv_match || "Not Set",
              title : results[j].title
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
    // retryErrors:true,
    dropDB:true,
    logName : "accounts_profile-fb_tags_202012030823",
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
    },
  // accountOvrdList: ["eng-ab"]
  }
);



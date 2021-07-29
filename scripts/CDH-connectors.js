const {
        reportHandler,
        constants: {DATABASE_TYPES},
        utils: {formattedDateTime}
      } = require("magic-metrics-tool");

const _ = require("underscore");

async function checkProfile(
    {
      CDH,
      record,
      error,
      account,
      profile,
      resolve,
        reject
    }) {


    const [errorResp, profileData] = await CDH.getProfile(account, profile).then(r => [null, r]).catch(e => [e]);
    if (errorResp) {
      return void reject(errorResp);
    }
    (profileData.connectors || []).forEach(connector => {

      record("connector",{
        account,
        profile,
        name   : connector.name || "<No Name found>",
        id     : connector.id,
        type   : connector.type,
        enabled: String(connector.enabled),
        hidden : String(connector.hidden)
      });

      if (connector.type.includes("webhook")){
        const actions = _.where(profileData.actions, {connectorId: connector.id});

        let url = "";

        for (const action of actions) {
          const templates = {};
          lblConfig: for (const env in action.configurations) {
            const params = action.configurations[env].parameters;
            for (let param_id in params) {
              if (!params[param_id].props) continue;
              if (params[param_id].props.name === "url") {
                if (params[param_id].values.length === 0 ) continue;
                url = params[param_id].values[0].text.value;
              }
              if (params[param_id].props.name === "templates") {
                if (params[param_id].values.length === 0 ) continue;
                for (const template of params[param_id].values){
                  const text =  template.text && template.text.value;
                  const value =  template.map_value && template.map_value.value;
                  templates[text] = value;
                }
              }
            }
          }
          if (url.includes("{{") ){
            const templateStr = url.match(/{{(.*?)}}/)[1];
            if (templateStr) {
              url = templates[templateStr] || url;
            }
          }
          if(!action.name) debugger;

          record("webhook_action",{
            account,
            profile,
            name   : action.name,
            id     : action.id,
            enabled: String(action.enabled),
            url: url
          });
        }

      }

    });
  resolve();
}

reportHandler({
      logName       : "cdh_connectors_allAccounts_"+formattedDateTime,
      checkProfile  : checkProfile,
      dbDataTypes   : [
        {
          name: "connector",
          definition: {
            name: DATABASE_TYPES.TEXT,
            id: DATABASE_TYPES.TEXT,
            type: DATABASE_TYPES.TEXT,
            enabled: DATABASE_TYPES.TEXT,
            hidden: DATABASE_TYPES.TEXT
          }
        },
        {
          name: "webhook_action",
          definition: {
            name: DATABASE_TYPES.TEXT,
            id: DATABASE_TYPES.TEXT,
            enabled: DATABASE_TYPES.TEXT,
            url: DATABASE_TYPES.TEXT
          }
        }
      ],
      getProfileData: false,
      useRequestCache: true,
      allAccounts: true,
      // retryErrors: true,
    });



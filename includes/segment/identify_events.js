const segmentCommon = require('./common');

// Format identify calls into a format suitable to join with all other events

module.exports = (params) => {

  return publish('segment_identify_events', {
    ...params.defaultConfig
  }).query(ctx => `
    ${params.frontendIdentifySchemas.map((schema) => 
        `select
          'segment'           as source,
          'user_identify'     as event,
          'User Identify'     as event_name,
          '${schema}'||'.'||'identifies' as source_table,
          current_timestamp() as updated_dt,

          ${Object.entries(params.defaultIdentifyFields).map(
            ([key, value]) => `${key} as ${value}`).join(',\n    ')}

          ${Object.keys(params.frontendIdentifyFields).length ? `,` : ``}
          ${Object.entries(params.frontendIdentifyFields).map(
              ([key, value]) => `${key} as ${value}`).join(',\n    ')}

          ${Object.keys(params.backendIdentifyFields).length ? `,` : ``}
          ${Object.entries(params.backendIdentifyFields).map(
                ([key, value]) => `null as ${value}`).join(',\n    ')}
    from 
      ${ctx.ref(`${schema}`,`identifies`)}`).join(`\nunion all \n`)}

    UNION ALL

    ${params.backendIdentifySchemas.map((schema) =>
      `select
          'segment'           as source,
          'user_identify'     as event,
          'User Identify'     as event_name,
          '${schema}'||'.'||'identifies' as source_table,
          current_timestamp() as updated_dt,

          ${Object.entries(params.defaultIdentifyFields).map(
            ([key, value]) => `${key} as ${value}`).join(',\n    ')}

          ${Object.keys(params.frontendIdentifyFields).length ? `,` : ``}
          ${Object.entries(params.frontendIdentifyFields).map(
              ([key, value]) => `null as ${value}`).join(',\n    ')}

          ${Object.keys(params.backendIdentifyFields).length ? `,` : ``}
          ${Object.entries(params.backendIdentifyFields).map(
            ([key, value]) => `${key} as ${value}`).join(',\n    ')}
    from 
      ${ctx.ref(`${schema}`, `identifies`)}`).join(`\nunion all \n`)}
`)
}
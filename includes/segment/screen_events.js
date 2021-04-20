const segmentCommon = require('./common');

// Format screen calls into a format suitable to join with all other events

module.exports = (params) => {

  return publish('segment_screens_events', {
    ...params.defaultConfig
  }).query(ctx => `

    ${params.includeScreenSchemas.map((schema) => 
        
        `select
          'segment'            as source,
          'screen_loaded'      as event, 
          'Screen Loaded'      as event_name,
          '${schema}'||'.'||'screens' as source_table,
          current_timestamp()   as updated_dt,
          NULL as anonymous_id,

          ${Object.entries(params.defaultScreenFields).map(
            ([key, value]) => `${key} as ${value}`).join(',\n    ')}
          
          ${Object.keys(params.customScreenFields).length ? `,` : ``}
          ${Object.entries(params.customScreenFields).map(
              ([key, value]) => `${key} as ${value}`).join(',\n    ')}
    from 
      ${ctx.ref(`${schema}`,`screens`)}`).join(`\nunion all \n`)}

`)
}

const segmentCommon = require('./common');

// Format page calls into a format suitable to join with all other events

module.exports = (params) => {

  return publish('segment_pages_events', {
    ...params.defaultConfig
  }).query(ctx => `

    ${params.includePageSchemas.map((schema) => 
        
        `select
          'segment'          as source,
          'page_viewed'      as event, 
          'Page Viewed'      as event_name, 
          '${schema}'||'.'||'pages' as source_table,
          current_timestamp() as updated_dt,
          
          ${Object.entries(params.defaultPageFields).map(
            ([key, value]) => `${key} as ${value}`).join(',\n    ')}

          ${Object.keys(params.customPageFields).length ? `,` : ``}
          ${Object.entries(params.customPageFields).map(
              ([key, value]) => `${key} as ${value}`).join(',\n    ')}
    from 
      ${ctx.ref(`${schema}`,`pages`)}`).join(`\nunion all \n`)}
`)
}

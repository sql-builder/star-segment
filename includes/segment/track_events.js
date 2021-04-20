const segmentCommon = require('./common');

// Format track calls into a format suitable to join with all other events
module.exports = (params) => {

  return publish('segment_tracks_events', {
    assertions: {
      uniqueKey: 'id'
    },
    ...params.defaultConfig
  }).query(ctx => `
 ${params.frontendTrackSchemas.map((schema) =>
    `select
        'segment'           as source,
        '${schema}'||'.'||'tracks' as source_table,
        current_timestamp() as updated_dt,
        anonymous_id,

        ${Object.entries(params.defaultTrackFields).map(
          ([key, value]) => `${key} as ${value}`).join(',\n    ')}
        
        ${Object.keys(params.frontendTrackFields).length ? `,` : ``}
        ${Object.entries(params.frontendTrackFields).map(
            ([key, value]) => `${key} as ${value}`).join(',\n    ')}
      from 
        ${ctx.ref(`${schema}`, `tracks`)}
  `).join(`\nunion all \n`)
}
UNION ALL

${params.backendTrackSchemas.map((schema) =>
  `select
      'segment'           as source,
      '${schema}'||'.'||'tracks' as source_table,
      current_timestamp() as updated_dt,
      NULL as anonymous_id,

      ${Object.entries(params.defaultTrackFields).map(
        ([key, value]) => `${key} as ${value}`).join(',\n    ')}
      
      ${Object.keys(params.backendTrackFields).length ? `,` : ``}
      ${Object.entries(params.backendTrackFields).map(
        ([key, value]) => `${key} as ${value}`).join(',\n    ')}
    from 
      ${ctx.ref(`${schema}`, `tracks`)}
`).join(`\nunion all \n`)
}
`)
}

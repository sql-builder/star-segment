const segmentCommon = require('./common');

module.exports = (params) => {

  return publish('segment_sessionized_pages', {
    ...params.defaultConfig,
    disabled: !params.includePageSessions
  }).query(ctx => `

-- annotate page records with session details
select
  segment_sessionized_events.session_index,
  segment_sessionized_events.session_id,
  segment_page_events.*   
from 
  ${ctx.ref(params.defaultConfig.schema, 'segment_user_events')} as segment_sessionized_events
  left join ${ctx.ref(params.defaultConfig.schema, 'segment_pages_events')} as segment_page_events
    on segment_sessionized_events.id = segment_page_events.id
where
  segment_sessionized_events.id is not null

`)
}

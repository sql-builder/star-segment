const sql = require('@dataform/sql')();
const segmentCommon = require('./common');

module.exports = (params) => {

  return publish('segment_user_events', {
    assertions: {
      uniqueKey: 'id'
    },
    ...params.defaultConfig
  }).query(ctx => `

with segment_events_combined as (
-- combine all enabled events tables into one combined events tables
${segmentCommon.enabledEvents(params).map((event) => 
`select
  id,
  timestamp,
  user_id,
  anonymous_id,
  source,
  source_table,
  updated_dt,
  event,
  event_name
from 
  ${ctx.ref(params.defaultConfig.schema,`segment_${event}_events`)}`).join(`\nunion all \n`)}

UNION ALL

select
  id,
  timestamp,
  user_id,
  anonymous_id,
  source,
  source_table,
  updated_dt,
  event,
  event_name
from
  ${ctx.ref(params.defaultConfig.schema, `segment_identify_events`)}

),

segment_events_mapped as (
-- map anonymous_id to user_id (where possible)
select
  coalesce(
    segment_events_combined.user_id,
    segment_user_anonymous_map.user_id,
    segment_events_combined.anonymous_id
  ) as user_id,

  segment_users.calendar_date,
  segment_users.calendar_date_alt,
  segment_users.day_no_of_month,
  segment_users.week_no_year,
  segment_users.cohort_week_number,
  segment_users.cohort_month_number,
  segment_users.first_seen_at,

  segment_events_combined.id,
  segment_events_combined.timestamp,
  segment_events_combined.source, 
  segment_events_combined.source_table,

  segment_events_combined.event,
  segment_events_combined.event_name
  
  ${Object.keys(params.customIdentifyFields).length ? `,` : ``}
  ${Object.entries(params.customIdentifyFields).map(
    ([key, value]) => `identifies.${value} as ${value}`).join(',\n    ')}

  ${params.customIdentifyFields.length ? `,` : ``}
  ${Object.entries(params.customIdentifyFields).map(
    ([key, value]) => `segment_users.first_${value} as first_${value}`).join(',\n    ')}

  ${Object.keys(params.customPageFields).length ? `,` : ``} 
  ${Object.entries(params.customPageFields).map(
    ([key, value]) => `pages.${value} as ${value}`).join(',\n    ')}

  ${Object.keys(params.customScreenFields).length ? `,` : ``}
  ${Object.entries(params.customScreenFields).map(
    ([key, value]) => `screens.${value} as ${value}`).join(',\n    ')}

  ${Object.keys(params.customTrackFields).length ? `,` : ``}
  ${Object.entries(params.customTrackFields).map(
    ([key, value]) => `track.${value} as ${value}`).join(',\n    ')}
  
from
  segment_events_combined
  left join ${ctx.ref(params.defaultConfig.schema, 'segment_user_map')} as segment_user_anonymous_map
    on segment_events_combined.anonymous_id = segment_user_anonymous_map.anonymous_id
  left join ${ctx.ref(params.defaultConfig.schema, 'segment_users')} as segment_users
    on  coalesce(
          segment_events_combined.user_id,
          segment_user_anonymous_map.user_id,
          segment_events_combined.anonymous_id
        ) = segment_users.user_id
  ${params.includeTracks ? `
    left join ${ctx.ref(params.defaultConfig.schema, 'segment_tracks_events')} as tracks
      on segment_events_combined.id = tracks.id
  ` : ``}
  ${params.includePages ? `
    left join ${ctx.ref(params.defaultConfig.schema, 'segment_pages_events')} as pages
      on segment_events_combined.id = pages.id
  ` : ``}
  ${params.includeScreens ? `
      left join ${ctx.ref(params.defaultConfig.schema, 'segment_screens_events')} as screens
      on segment_events_combined.id = screens.id
  ` : ``}
    left join ${ctx.ref(params.defaultConfig.schema, 'segment_identify_events')} as identifies
      on segment_events_combined.id = identifies.id
)
${ctx.when(params.includeUserSessions == true,`,
session_starts as (
-- label the event that starts the session
select
  *,
  coalesce(
    (
      ${sql.timestamps.diff(`millisecond`,
      sql.windowFunction( 'lag',
        'timestamp',
        false,
        {
          partitionFields: ['user_id'],
          orderFields: ['timestamp asc']
        }
      ),
      `
    segment_events_mapped.timestamp `
      )}
    ) >= ${params.sessionTimeoutMillis},
    true
  ) as session_start_event
from
  segment_events_mapped
),

with_session_index as (
-- add a session_index (users first session = 1, users second session = 2 etc)
select
  *,
  ${sql.windowFunction(
      'sum',
        'case when session_start_event then 1 else 0 end',
        false,
        {
        partitionFields: ['user_id'],
        orderFields: ['session_starts.timestamp asc'],
        frameClause: 'rows between unbounded preceding and current row'
        }
    )} as session_index
from
  session_starts
)

-- add a unique session_id to each session
select
  *,
  ${sql.surrogateKey(['session_index', 'user_id'])} as session_id
from
  with_session_index

`)}

${ctx.when(params.includeUserSessions == false, `
select *
from 
  segment_events_mapped
order by timestamp desc, user_id desc, id desc  
`)}
`
)}

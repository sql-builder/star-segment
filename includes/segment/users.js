const segmentCommon = require('./common');
const sql = require('@dataform/sql')();

let USER = `coalesce(
  identifies.user_id,
  segment_user_anonymous_map.user_id,
  segment_user_anonymous_map.anonymous_id
)`;

module.exports = (params) => {
  return publish('segment_users', {
    assertions: {
      uniqueKey: 'user_id'
    },
    description: 'Users aggregates all identifies calls to give a table with one row per user_id. Identify calls without only an anonymous_id are mapped to the user where possible.',
    columns: {
      user_id: 'Unique identifier of the user',
      first_seen_at: 'First time this user was seen'
    },
    ...params.defaultConfig
  }).query(ctx => `
with users_first as (
    select distinct
      ${USER} as user_id,
      ${sql.windowFunction(
            'first_value',
            'coalesce(identifies.original_timestamp,identifies.timestamp)',
            true,
            {
              partitionFields: [USER],
              orderFields: ['identifies.timestamp asc'],
              frameClause: 'rows between unbounded preceding and unbounded following'
            }
          )} as first_seen_at

       -- User Custom Fields
      ${params.customUserFields.length ? `,` : ``}
      ${params.customUserFields.map(f => `${sql.windowFunction(
        "first_value",
        `identifies.${f}`,
        false,
        {
          partitionFields: [USER],
          orderFields: ["identifies.timestamp desc"],
          frameClause: "rows between unbounded preceding and unbounded following",
        }
      )} as first_${f}`).join(",\n  ")}
      ${params.customUserFields.length ? `,` : ``}
      ${params.customUserFields.map(f => `${sql.windowFunction(
        "last_value",
        `identifies.${f}`,
        false,
        {
          partitionFields: [USER],
          orderFields: ["identifies.timestamp desc"],
          frameClause: "rows between unbounded preceding and unbounded following",
        }
      )} as last_${f}`).join(",\n  ")}

      -- Frontend Identifies
      ${Object.keys(params.frontendIdentifyFields).length ? `,` : ``}
      ${Object.entries(params.frontendIdentifyFields).map(([key, value])  => `${sql.windowFunction(
        'first_value',
        `identifies.${value}`,
        false,
        {
          partitionFields: [USER],
          orderFields: ['identifies.timestamp desc'],
          frameClause: 'rows between unbounded preceding and unbounded following',
        }
      )} as first_${value}`).join(',\n  ')}
      ${Object.keys(params.frontendIdentifyFields).length ? `,` : ``}
      ${Object.entries(params.frontendIdentifyFields).map(([key, value])  => `${sql.windowFunction(
        'last_value',
        `identifies.${value}`,
        false,
        {
          partitionFields: [USER],
          orderFields: ['identifies.timestamp desc'],
          frameClause: 'rows between unbounded preceding and unbounded following',
        }
      )} as last_${value}`).join(',\n  ')}

      -- Backend Identifies
      ${Object.keys(params.backendIdentifyFields).length ? `,` : ``}
      ${Object.entries(params.backendIdentifyFields).map(([key, value])  => `${sql.windowFunction(
        'first_value',
        `identifies.${value}`,
        false,
        {
          partitionFields: [USER],
          orderFields: ['identifies.timestamp desc'],
          frameClause: 'rows between unbounded preceding and unbounded following',
        }
      )} as first_${value}`).join(',\n  ')}
      ${Object.keys(params.backendIdentifyFields).length ? `,` : ``}
      ${Object.entries(params.backendIdentifyFields).map(([key, value])  => `${sql.windowFunction(
        'last_value',
        `identifies.${value}`,
        false,
        {
          partitionFields: [USER],
          orderFields: ['identifies.timestamp desc'],
          frameClause: 'rows between unbounded preceding and unbounded following',
        }
      )} as last_${value}`).join(',\n  ')}
    from
      ${ctx.ref(params.defaultConfig.schema, 'segment_user_map')} as segment_user_anonymous_map
      left join ${ctx.ref(params.defaultConfig.schema, 'segment_identify_events')} as identifies
        on (identifies.anonymous_id = segment_user_anonymous_map.anonymous_id
        or identifies.user_id = segment_user_anonymous_map.user_id
    )
)
select 
    dates.calendar_date,
    dates.calendar_date_alt,
    dates.day_no_of_month,
    dates.week_no_year,
    datediff(week, date(date_trunc(week, (select min(first_seen_ts) as dayZero from users_first))),
    date(date_trunc(week, users_first.first_seen_ts))
    ) as cohort_week_number,
    datediff(month,
    date(date_trunc(month, (select min(first_seen_ts) as dayZero from users_first))),
    date(date_trunc(month, users_first.first_seen_ts))
    ) as cohort_month_number,
    users_first.*
from ${ctx.ref('date_dim')} as dates
left join users_first 
  on dates.date_at = date(users_first.first_seen_at)
where
  dates.date_at >= (select min(first_seen_at) as day0 from users_first)
  and dates.date_at <= CURRENT_DATE()
`)
}

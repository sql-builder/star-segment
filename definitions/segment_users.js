const segment = require('../');

const segmentDeclare = segment({


    // The timeout for splitting sessions in milliseconds.
    sessionTimeoutMillis: 30 * 60 * 1000,


    // defaultConfig is the warehouse default setup info
    defaultConfig: {
        database: 'analytics',
        schema: 'segment_users_star', // Destination Schema
        tags: ['segment'],
        type: 'table'
    },

    // If sources are not in the same destination warehouse schema as the defaultConfig, set to false and declare below
    declareSources: false,
    segmentSource: 'java_prod',

    ////////////////////
    //   Page Calls   //
    ////////////////////
    // From here: https://segment.com/docs/connections/spec/page/
    includePageSchemas: ['gm_website'], // List out all schemas for page calls
    customPageFields: {
        url: 'url',
        title: 'title',
        name: 'name',
        search: 'search',
        referrer: 'referrer',
        path: 'path',
        context_ip: 'ip',
        context_locale: 'locale',
        context_user_agent: 'user_agent',
        context_campaign_term: 'utm_term',
        context_campaign_medium: 'utm_medium',
        context_campaign_source: 'utm_source',
        context_campaign_name: 'utm_campaign',
        context_campaign_content: 'utm_content',
        // context_campaign_placement: 'utm_placement'
    },
    // Defaults for page calls
    includePageSessions: true,
    defaultPageFields: {
        id: 'id',
        anonymous_id: 'anonymous_id',
        user_id: 'user_id',
        timestamp: 'timestamp'
    },

    ////////////////////
    //  Screen Calls  //
    ////////////////////
    // From here: https://segment.com/docs/connections/spec/screen/
    includeScreenSchemas: ['ios_prod','android_prod'], // List out all schemas for page calls
    customScreenFields: {},
    // Defaults for screen calls
    includeScreenSessions: true,
    defaultScreenFields: {
        id: 'id',
        user_id: 'user_id',
        timestamp: 'timestamp'
    },

    ////////////////////
    //  Track Calls   //
    ////////////////////
    // From here: https://segment.com/docs/connections/spec/track/
    // List out all web schemas for identity calls
    frontendTrackSchemas: ['gm_website', 'ios_prod', 'android_prod'],
    frontendTrackFields: {},

    // List out all server-side schemas for identity calls
    backendTrackSchemas: ['java_prod'],
    backendTrackFields: {
    }, // Must be present in all tables

    includeTrackSessions: true,
    defaultTrackFields: {
        id: 'id',
        user_id: 'user_id',
        timestamp: 'timestamp',
        event: 'event',
        event_text: 'event_name'
    },

    ////////////////////
    // Identity Calls //
    ////////////////////
    // From here: https://segment.com/docs/connections/spec/identify/
    // List out all web/app schemas for identity calls
    frontendIdentifySchemas: ['gm_website'],
    frontendIdentifyFields: { anonymous_id: 'anonymous_id'},

    // List out all server-side schemas for identity calls
    backendIdentifySchemas: ['android_prod', 'ios_prod', 'java_prod'],
    backendIdentifyFields: {
    }, // Must be present in all tables

    defaultIdentifyFields: {
        id: 'id',
        user_id: 'user_id',
        timestamp: 'timestamp'
    },

    ////////////////////////
    // User Events Fields //
    ////////////////////////
    customUserFields: [],
        // 'url',
        // 'title',
        // 'name',
        // 'search',
        // 'referrer',
        // 'path',
        // 'ip',
        // 'locale',
        // 'user_agent',
        // 'utm_term',
        // 'utm_medium',
        // 'utm_source',
        // 'utm_campaign',
        // 'utm_content',
        // 'utm_placement'],
    includeUserSessions: true,

    // Include Screens in build if source is app 
    // Include Pages if source is website
    includeScreens: true,
    includePages: true,
    includeTracks: true
});


// List of all source tables for segment pages, screens, tracks and identifies. 
// Pages
declare({
    database: 'raw',
    schema: 'gm_website',
    name: 'pages'
});


// Screens
declare({
  database: 'raw',
  schema: 'ios_prod',
  name: 'screens'
});
declare({
    database: 'raw',
    schema: 'android_prod',
    name: 'screens'
});


// Tracks Web Events
declare({
    database: 'raw',
    schema: 'gm_website',
    name: 'tracks'
});


// App Track Events
declare({
    database: 'raw',
    schema: 'ios_prod',
    name: 'tracks'
});
declare({
    database: 'raw',
    schema: 'android_prod',
    name: 'tracks'
});

// Tracks Backend Events
declare({
    database: 'raw',
    schema: 'java_prod',
    name: 'tracks'
});


// Identifies Web Events
declare({
    database: 'raw',
    schema: 'gm_website',
    name: 'identifies'
});


// Identifies App Events
declare({
    database: 'raw',
    schema: 'ios_prod',
    name: 'identifies'
});
declare({
    database: 'raw',
    schema: 'android_prod',
    name: 'identifies'
});


// Identifies Backend Events
declare({
    database: 'raw',
    schema: 'java_prod',
    name: 'identifies'
});

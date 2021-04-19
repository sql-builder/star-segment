const users = require('./includes/segment/users');
const identifyEvents = require('./includes/segment/identify_events');
const sessions = require('./includes/segment/sessions');
const pageEvents = require('./includes/segment/page_events');
const sessionizedPages = require('./includes/segment/sessionized_pages');
const trackEvents = require('./includes/segment/track_events');
const sessionizedTracks = require('./includes/segment/sessionized_tracks');
const screenEvents = require('./includes/segment/screen_events');
const sessionizedScreens = require('./includes/segment/sessionized_screens');
const userMap = require('./includes/segment/user_map');
const userEvents = require('./includes/segment/user_events');

module.exports = (params) => {

    params = {
        segmentSchema: 'javascript', // default just as fall-back
        includePageSchemas: [], // list of schemas for Page schemas
        includeScreenSchemas: [], // list of schemas for Screen schemas
        includeTrackSchemas: [], // list of schemas for Track schemas
        includeIdentifySchemas: [], // list of schemas for Identify schemas
        
        customIdentifySchemas: [], // list of schemas for Identify schemas
        customPageFields: [], // list of custom fields to extract from the pages table
        customIdentifyFields: [], // list of custom fields to extract from the identifies table
        standardIdentifyFields: [], 
        customTrackFields: [], // list of custom fields to extract from the tracks table
        customScreenFields: [], // list of custom fields to extract from the tracks table

        defaultPageFields: [], // list of default fields to extract from the pages table
        defaultIdentifyFields: [], // list of default fields to extract from the identifies table
        defaultTrackFields: [], // list of default fields to extract from the tracks table
        defaultScreenFields: [], // list of default fields to extract from the tracks table
        declareSources: false,
        includeTracks: true,
        includeTrackSessions: true,
        includePages: true,
        includePageSessions: true,
        includeScreens: true,
        includeScreenSessions: true,
        includeUserSessions: true,
        ...params
    };

    const {
        segmentSchema,
        includePageSchemas,
        includeScreenSchemas,
        includeTrackSchemas,
        includeIdentifySchemas,

        customIdentifySchemas,
        customPageFields,
        customIdentifyFields,
        standardIdentifyFields,
        customTrackFields,
        customScreenFields,

        defaultPageFields,
        defaultIdentifyFields,
        defaultTrackFields,
        defaultScreenFields,
        declareSources,
        includeTracks,
        includePages,
        includeScreens,
    } = params;

    let identifies, pages, tracks, screens;

    if (declareSources) {
        identifies = declare({
            ...defaultConfig,
            schema: segmentSchema,
            name: 'identifies'
        });

        if (includePages) {
            pages = declare({
                ...defaultConfig,
                schema: segmentSchema,
                name: 'pages'
            });
        }

        if (includeTracks) {
            tracks = declare({
                ...defaultConfig,
                schema: segmentSchema,
                name: 'tracks'
            });
        }

        if (includeScreens) {
            screens = declare({
                ...defaultConfig,
                schema: segmentSchema,
                name: 'screens'
            });
        }
    }

    // Publish and return datasets.
    let result = {
        identifies,
        users: users(params),
        identifyEvents: identifyEvents(params)
    };

    if (includePages) {
        result = {
            ...result,
            pages,
            pageEvents: pageEvents(params),
            sessionizedPages: sessionizedPages(params)
        };
    }

    if (includeTracks) {
        result = {
            ...result,
            tracks,
            trackEvents: trackEvents(params),
            sessionizedTracks: sessionizedTracks(params)
        };
    }

    if (includeScreens) {
        result = {
            ...result,
            screens,
            screenEvents: screenEvents(params),
            sessionizedScreens: sessionizedScreens(params)
        };
    }

    result = {
        ...result,
        sessions: sessions(params),
        userEvents: userEvents(params),
        userMap: userMap(params)
    };

    return result;
}

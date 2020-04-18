const defaultInfo = {
    override: false,
    handle: null,
    name: null,
    gender: null,
    birthDate: null,
    birthYear: null,
    language: null,
    religion: null,
    currentLocation: null,
    homeLocation: null,
    joined: null,
    mutualFriends: null,
    followers: null,
    interestedIn: null,
    linkedIn: null,
    googleTalk: null,
    skype: null,
    familyMember: [],
    mobile: []
};

const familyMemberCategories = [
    'Cousin',
    'Brother',
    'Sister',
    'Nephew',
    'Family member',
    'Grandson',
    'Brother-in-law'
];

const featuresToExclude = [
    '?',
    'bookmarks',
    'donate',
    'events',
    'find-friends',
    'friends',
    'gaming',
    'groups',
    'groupslanding',
    'marketplace',
    'me/',
    'memories',
    'messages',
    'mutual_friends',
    'notes',
    'notifications',
    'pages',
    'permalink',
    'photo',
    'posts',
    'settings',
    'stories',
    'videos',
    'watch'
];

const profileFeatures = [
    'about_overview',
    'about_work_and_education',
    'about_places',
    'about_contact_and_basic_info',
    'about_family_and_relationships',
    'about_details',
    'about_life_events'
];

const titlesToExclude = [
    'About',
    'Earlier',
    'Friends',
    'New',
    'Notifications',
    'Messenger'
];

const pageLoadingStyle = {
    waitLoad: true,
    waitNetworkIdle: true,
    waitUntil: ['domcontentloaded']
};

exports.DEFAULT_INFO = defaultInfo;
exports.FAMILY_MEMBER_CATEGORIES = familyMemberCategories;
exports.FEATURES_TO_EXCLUDE = featuresToExclude;
exports.PROFILE_FEATURES = profileFeatures;
exports.TITLES_TO_EXCLUDE = titlesToExclude;
exports.PAGE_LOADING_STYLE = pageLoadingStyle;

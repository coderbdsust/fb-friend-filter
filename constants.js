const defaultInfo = {
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

const titleToExclude = [
    'About',
    'Earlier',
    'Friends',
    'New',
    'Notifications',
    'Messenger'
];

exports.DefaultInfo = defaultInfo;
exports.FamilyMemberCategories = familyMemberCategories;
exports.FeaturesToExclude = featuresToExclude;
exports.ProfileFeatures = profileFeatures;
exports.TitleToExclude = titleToExclude;

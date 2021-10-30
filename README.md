# Facebook Friend's Basic Information Search
This project is for searching friend from a facebook account with given credentials and collecting the basic accessable data from friend's profile and save it in a JSON file

## Getting Started

Create `credential.json` file in root directory by mimicking `credential-sample.json` file and populate the properties.

## Running Project and Expected Output

* After running the js file using cmd `node scrape.js`, a new json file named `friend_<facebook_email>.json` will be created and all the friend profile link will be saved in this file

```json
    {
        "allProfileFound": false,
        "friendLinkRetrievalRatio": 0.0,
        "friendCount": 0,
        "probableFriendLinkCount": 0,
        "profileLinkSearchTime": 0.00,
        "profiles": []
    }
```

* After running the js file using `node parseprofile.js`, a new json file named `knowledgebase_<facebook_email>.json` will be created and basic information from a friend will be saved in this file

```json
    {
    "totalProfiles": 0,
    "retrievedProfiles": 0,
    "retrievedProfilesPercent": 0.0,
    "profileInfos": {
        "<friend_user_name>": {
            "override": false,
            "handle": null,
            "name": null,
            "gender": null,
            "birthDate": null,
            "birthYear": null,
            "language": null,
            "religion": null,
            "currentLocation": null,
            "homeLocation": null,
            "joined": null,
            "mutualFriends": null,
            "followers": null,
            "interestedIn": null,
            "linkedIn": null,
            "googleTalk": null,
            "skype": null,
            "familyMember": [],
            "mobile": [],
            "spouseName": null,
            "marriageDate": null,
            "institutions": []
        }
    }
}
```

## Format your changes with ESLint

Run following command to see the errors and warnings for a file:

```
./node_modules/.bin/eslint <filename>
```

Run following command to fix errors and warnings automatically in a file:

```
./node_modules/.bin/eslint <filename>
```

## Technology

* [Node](https://nodejs.org/en/ "Node JS")
* [Chrowmium](https://www.chromium.org/ "Chromium")

## Developers

* [Sakibul Mowla](https://www.linkedin.com/in/sakibulmowla/ "Sakibul Mowla LinkedIn Profile")
* [Biswajit Debnath](https://www.linkedin.com/in/coderbd/ "Biswajit Debnath's LinkedIn Profile")

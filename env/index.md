[⬅️ Back](../README.md)

## Multiple environments support ##

Project is able to change: request URLs, secret keys, app name, app id, etc. just in few seconds.
So we can switch between `dev`, `stage`, `prod` environments for example

### To switch environments ###
- ```yarn env:dev``` or
- ```yarn env:stage``` or
- ```yarn env:prod```, etc.
- and `re-build` app

### Libraries
- [react-native-config](https://www.npmjs.com/package/react-native-config)
  - cons:
    - variables can be used in native code
  - pros:
    - complex setup
    - configs can't be changed in runtime
- [react-native-dotenv](https://www.npmjs.com/package/react-native-dotenv)
  - cons:
    - simple setup
    - config changes doesn't require app re-build
  - pros:
    - variables can't be used in native code

I prefer `react-native-config` as we can easily change application id, name, deeplinks in native code

### Structure ###
Do not store sensitive info in the same repository with project.
Better store it in separate private repository with limited access.

Main idea: each folder contains all env-specific configs and files.
And we have script that takes files from necessary folder and puts where it 
needs to be

- 📁 `env`
  - setup.sh
  - Readme.md
  - 📁 `dev`
    - env
    - google-services.json
    - google-service-key.json
    - GoogleService-Info.plist
    - release.keystore
  - 📁 `prod`
    - env
    - google-services.json
    - google-service-key.json
    - GoogleService-Info.plist
    - release.keystore
  - 📁 `staging`
    - env
    - google-services.json
    - google-service-key.json
    - GoogleService-Info.plist
    - release.keystore

Don't forget to add following lines to the `.gitignore`
```
# react-native-config
.env
env/
```

## Environment variables
After steps above completed you should be able to fill
all these keys in `.env` file with valid data

### General variables
| key              | description |
|------------------|-------------|
| APP_NAME         |             |
| APP_ID           |             |
| BASE_URL         |             |
| DEFAULT_LANGUAGE |             |
| API_KEY          |             |
| GOOGLE_MAPS_KEY  |             |

### Android specific:
| key                          | description |
|------------------------------|-------------|
| ANDROID_SIGNING_ALIAS        |             |
| ANDROID_SIGNING_PASSWORD     |             |

### iOS specific:
| key                          | description |
|------------------------------|-------------|
| DEVELOPMENT_TEAM             |             |
| APP_STORE_ID                 |             |
| IOS_CREDS_REPO               |             |
| MATCH_PASSWORD               |             |
| IOS_API_ID                   |             |
| IOS_API_KEY                  |             |
| IOS_API_ISSUER               |             |

### Web specific:
| key                          | description |
|------------------------------|-------------|
| FIREBASE_API_KEY             |             |
| FIREBASE_AUTH_DOMAIN         |             |
| FIREBASE_DB_URL              |             |
| FIREBASE_PROJECT_ID          |             |
| FIREBASE_STORAGE_BUCKET      |             |
| FIREBASE_MESSAGING_SENDER_ID |             |
| FIREBASE_APP_ID              |             |
| FIREBASE_MEASUREMENT_ID      |             |

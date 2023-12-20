echo "Setup env: $1";

cp "./env/configs/$1/env" "./.env";
cp "./env/configs/$1/google-service-key.json" "./"
cp "./env/configs/$1/release.keystore" "./android/app/"
cp "./env/configs/$1/google-services.json" "./android/app/"
cp "./env/configs/$1/GoogleService-Info.plist" "./ios/app/"

#!/bin/bash

export JAVA_HOME="/Library/Java/JavaVirtualMachines/zulu-17.jdk/Contents/Home"
export ANDROID_HOME="$HOME/Library/Android/sdk"

# Build and run with only arm64-v8a to avoid Windows 260 character path limit
cd android
./gradlew installDebug -PreactNativeArchitectures=arm64-v8a
cd ..

# Start Metro bundler
npx expo start

#!/bin/bash

pushd "$CI_PROJECT_DIR/lambda" || exit

# Prune node_modules down to only those necessary for production
yarn install --prod --frozen-lockfile --cache-folder "$CI_PROJECT_DIR/.yarn"

# Print the size of node_modules
echo node_modules size: "$(du -hs node_modules)"

pushd "$CI_PROJECT_DIR" || exit

# Install envsubst and sponge
apt-get update
apt-get --yes install moreutils gettext

# Template ask-resources.json with any environment variables
envsubst < ask-resources.json | sponge ask-resources.json
cat ask-resources.json

# Add ask-cli globally and deploy
yarn global add ask-cli --cache-folder "$CI_PROJECT_DIR/.yarn"
ask deploy

# Commit any changes and push the result back to the default branch
if [[ -n $(git status -s) ]]; then
  echo "Found the following changes:"
  git status

  git config user.name "days-until-bot"
  git config user.email "days-until-bot@nathanfriend.io"

  REPO_URL="${CI_SERVER_PROTOCOL}://${COMMITTER_USER}:${COMMITTER_TOKEN}@${CI_SERVER_URL#http*//}/${CI_PROJECT_PATH}.git"
  git remote set-url --push origin "${REPO_URL}"

  echo "Commiting changes and pushing to ${REPO_URL}..."
  git add .ask/ask-states.json
  git add ask-resources.json
  git commit -m 'Update deployment state'
  git push origin "HEAD:${CI_DEFAULT_BRANCH}" -o ci.skip
else
  echo "No changes detected to deployment state"
fi

popd || exit

# Run a regular yarn install to restore node_modules before it's cached
yarn install --frozen-lockfile --cache-folder "$CI_PROJECT_DIR/.yarn"

popd || exit

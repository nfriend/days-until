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

# Commit any changes made to infrastructure/cfn-deployer/skill-stack.yaml
# and push the result back to the default branch
if [[ -n $(git status -s) ]]; then
  echo "Found the following changes in infrastructure/cfn-deployer/skill-stack.yaml:"
  git status

  git config user.name "days-until-bot"
  git config user.email "days-until-bot@nathanfriend.io"

  REPO_URL="${CI_SERVER_PROTOCOL}://${COMMITTER_USER}:${COMMITTER_TOKEN}@${CI_SERVER_URL#http*//}/${CI_PROJECT_PATH}.git"
  echo "Pushing to ${REPO_URL}..."
  git remote set-url --push origin "${REPO_URL}"

  git add infrastructure/cfn-deployer/skill-stack.yaml
  git commit -m 'Update some stuff automatically'
  git push origin "HEAD:${CI_DEFAULT_BRANCH}" -o ci.skip
else
  echo "No changes detected to infrastructure/cfn-deployer/skill-stack.yaml"
fi

popd || exit

# Run a regular yarn install to restore node_modules before it's cached
yarn install --frozen-lockfile --cache-folder "$CI_PROJECT_DIR/.yarn"

popd || exit

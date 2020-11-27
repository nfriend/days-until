#!/bin/bash

pushd $CI_PROJECT_DIR/lambda

# Prune node_modules down to only those necessary for production
yarn install --prod --frozen-lockfile --cache-folder $CI_PROJECT_DIR/.yarn

# Print the size of node_modules
echo node_modules size: $(du -hs node_modules)

pushd $CI_PROJECT_DIR

# Install envsubst and sponge
apt-get update
apt-get --yes install moreutils gettext

# Template ask-resources.json with any environment variables
envsubst < ask-resources.json | sponge ask-resources.json
cat ask-resources.json

# Add ask-cli globally and deploy
yarn global add ask-cli --cache-folder $CI_PROJECT_DIR/.yarn
ask deploy

# Commit any changes made to infrastructure/cfn-deployer/skill-stack.yaml
# and push the result back to the default branch
if [[ -z $(git status -s) ]]; then
  echo "Found the following changes in infrastructure/cfn-deployer/skill-stack.yaml:"
  git status

  git config user.name "days-until-bot"
  git config user.name "days-until-bot@nathanfriend.io"
  git remote set-url --push origin $CI_REPOSITORY_URL

  git add infrastructure/cfn-deployer/skill-stack.yaml
  git commit -m 'Update skill-stack.yaml from deployment'
  git push -o ci.skip
else
  echo "No changes detected to infrastructure/cfn-deployer/skill-stack.yaml"
fi

popd

# Run a regular yarn install to restore node_modules before it's cached
yarn install --frozen-lockfile --cache-folder $CI_PROJECT_DIR/.yarn

popd

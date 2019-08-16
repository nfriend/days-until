
echo "Cleaning...";
rm handleDaysUntil.zip

echo "Building...";
npm run build;

# Doesn't work - the output zip files can't be read by lambda
# echo "Compressing...";
# zip handleDaysUntil.zip ./*

# This requires that 7zip is installed and is available at the command line:
# https://superuser.com/a/667076/144803
echo "Compressing...";
7za a handleDaysUntil.zip ./* -mx9

echo "Uploading...";
aws lambda update-function-code --function-name handleDaysUntil --zip-file "fileb://$PWD/handleDaysUntil.zip"

echo "Done!";
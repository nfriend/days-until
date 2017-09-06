
Write-Host "Cleaning...";
Remove-Item .\handleDaysUntil.zip

Write-Host "Building...";
npm run build;

# Doesn't work!  AWS can't read anything in node_modules for some reason
# Compress-Archive -DestinationPath handleDaysUntil.zip -Force -Path ./* -CompressionLevel NoCompression;

# using 7-zip instead.  This assumes that the 7-zip binary (7za.exe) is available in your PATH
Write-Host "Compressing...";
7za a handleDaysUntil.zip .\* -mx9

Write-Host "Uploading...";
aws lambda update-function-code --function-name handleDaysUntil --zip-file fileb://C:/Users/Nathan/Documents/GitHub/days-until/lambda/handleDaysUntil.zip

Write-Host "Done!";
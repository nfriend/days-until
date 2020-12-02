# Days Until assets

Assets in this directory are auto-uploaded to the S3 bucket as part of the
`upload assets` job in the deployment pipeline. This bucket is not currently
managed by CloudFormation - it must be created/managed manually before the
pipeline runs in order for the upload to succeed.

## Images

When possible, both PNG and SVG versions of each file are uploaded to allow the
PNGs to be regenerated at a higher resolution if necessary in the future.

Assets are accessed through [AWS
CloudFront](https://aws.amazon.com/cloudfront/). The domain name of the current
distribution is `d1qqbfelg1beem.cloudfront.net`.

See the [**Acknowledgements** section in
README.md](../../README.md#acknowledgements) for image attributions. Remember to
add to this list if any new icons are added.

## Audio

Similar to the images, audio files should be converted into a small format
(`*.mp3`), but the uncompressed version should be stored as well for later use.

## Notes

Some notes if/when recreating the S3 bucket and CloudFront distributions:

- The S3 bucket need to allow public read access
- The S3 bucket needs to allow CORS
  - Test using `<img src="https://path/to/image/in/s3" crossorigin="anonymous">`

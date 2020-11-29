# Days Until assets

Assets in this directory are not auto-uploaded as part of the deploy process.
Any new or updated images must be manually uploaded to the `days-until-assets`
S3 bucket before they can be used by this skill.

Assets are accessed through [AWS
CloudFront](https://aws.amazon.com/cloudfront/). The domain name of the current
distribution is `d1qqbfelg1beem.cloudfront.net`.

See the [**Acknowledgements** section in
README.md](../../README.md#acknowledgements) for image attributions.

## Notes

Some notes if/when recreating the S3 bucket and CloudFront distributions:

- The S3 bucket need to allow public read access
- The S3 bucket needs to allow CORS
  - Test using `<img src="https://path/to/image/in/s3" crossorigin="anonymous">`

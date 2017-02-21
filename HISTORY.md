
1.2.0 / 2017-02-21
==================

  * Rebuild against newest integration worker version

1.2.0 / 2017-01-31
==================

  * Standardize integration (linting, Docker configuration, circle.yml, upgrade
segmentio-integration version, upgrade integration-worker version, etc.)


1.1.1 / 2016-10-10
==================

  * Update PaymentInfoAdded to PaymentInfoEntered 

1.1.0 / 2016-09-07
==================

  * add support for spec v2

1.0.8 / 2016-08-31
==================

  * deprecate order started, use checkout started

1.0.7 / 2016-08-17
==================

  * add support to override facebook content_id and content_type

1.0.6 / 2016-07-20
==================

  * Respect adTrackingEnabled field in context

1.0.5 / 2016-07-11
==================

  * Fix for consistent API endpoint for Application Opened event

1.0.4 / 2016-07-05
==================

  * Bug fix for UI issue where appEvent names could be null
  * Include _appVersion and bundle_short_id on all calls

1.0.3 / 2016-06-13
==================

  * Replace periods in custom event names with underscores
  * Truncate custom event names > 40 characters

1.0.2 / 2016-06-07
==================

  * Fix error when appEvents are empty

1.0.1 / 2016-06-06
==================

  * Bump Circle Deps


1.0.0 / 2016-06-06
==================

  * First Release, uses Facebook API Version 2.6

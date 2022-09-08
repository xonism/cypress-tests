`update-confluence-page.js` has functions that parse through all `spec` files, extract test names (values after `describe` & `it`) & sends formatted test names to Confluence's `Automatic E2E Tests` page via its API.

It is used in the `Update Confluence Page with Test Names` Github Action.

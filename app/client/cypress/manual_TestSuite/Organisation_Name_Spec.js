const homePage = require("../../../locators/HomePage.json");

describe("Checking for error message on Organisation Name ", function() {
  it("Ensure of Inactive Submit button ", function() {
    // Navigate to home Page
    // Click on Create Organisation
    // Type "Space" as first character
    // Ensure "Submit" button does not get Active
    // Now click on "X" (Close icon) ensure the pop up closes
  });
  it("Reuse the name of the deleted application name ", function() {
    // Navigate to home Page
    // Create an Application by name "XYZ"
    // Add some widgets
    // Navigate back to the application
    // Delete the Application
    // Click on "Create New" option under samee organisation
    // Enter the name "XYZ"
    // Ensure the application can be created with the same name
  });
  it("Adding Special Character ", function() {
    // Navigate to home Page
    // Click on Create Organisation
    // Add special as first character
    // Ensure "Submit" get Active
    // Now click outside and ensure the pop up closes
  });
});

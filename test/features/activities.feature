@core
Feature: Activities
  In order to review recorded activity in the application,
  As a user
  I need to be able to access the Activities page

  @javascript
  Scenario: Access activities page
    Given I am authenticated as "Administrator"
    And I am on "/index.php?m=activity"
    Then I should see "Activities"

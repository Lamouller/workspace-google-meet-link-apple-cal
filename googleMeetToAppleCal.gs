/**
 * Retrieves all users from the Google Workspace domain.
 */
function getAllUsers() {
  const domain = 'your-domain.com'; // Replace with your Google Workspace domain
  const users = AdminDirectory.Users.list({
    domain: domain,
    maxResults: 500, // Adjust if you have more than 500 users
  });

  if (users.users && users.users.length > 0) {
    Logger.log(`Found ${users.users.length} users in the domain.`);
    return users.users.map(user => user.primaryEmail);
  } else {
    Logger.log('No users found in the domain.');
    return [];
  }
}

/**
 * Iterates through all users and adds a Google Meet link to recent events if necessary.
 */
function processDomainEvents() {
  const domainUsers = getAllUsers(); // Retrieves the users in the domain
  domainUsers.forEach(email => {
    try {
      addMeetToUserEvents(email); // Processes events for each user
    } catch (e) {
      Logger.log(`Error processing user ${email}: ${e.message}`);
    }
  });
}

/**
 * Checks recent events for a user and adds a Google Meet link if necessary.
 * @param {string} email - The email of the user to process.
 */
function addMeetToUserEvents(email) {
  const calendarId = email; // Use the email as the calendar ID
  const now = new Date();
  const minutesFromLastUpdate = 5; // Check events modified in the last 5 minutes
  const updatedMin = new Date(now.getTime() - minutesFromLastUpdate * 60000);
  const events = Calendar.Events.list(calendarId, {
    timeMin: now.toISOString(),
    updatedMin: updatedMin.toISOString(),
    singleEvents: true,
    orderBy: 'startTime',
    maxResults: 10, // Check up to 10 recent events
  });

  if (events.items && events.items.length > 0) {
    events.items.forEach(event => {
      Logger.log(`Processing event for ${email}: ${event.summary || 'No title'} (${event.id})`);

      // Add a Google Meet link only if no conference data exists
      if (
        event.status !== 'cancelled' &&
        event.start.dateTime && // Ignore all-day events
        (!event.conferenceData || !event.conferenceData.entryPoints) // No existing Google Meet link
      ) {
        Logger.log(`Adding Google Meet to event: ${event.id}`);
        const requestId = Utilities.getUuid();
        event.conferenceData = {
          createRequest: {
            requestId: requestId,
            conferenceSolutionKey: { type: 'hangoutsMeet' },
          },
        };
        try {
          Calendar.Events.patch(
            { conferenceData: event.conferenceData },
            calendarId,
            event.id,
            { conferenceDataVersion: 1, sendUpdates: 'externalOnly' }
          );
          Logger.log(`Google Meet added successfully to event: ${event.id}`);
        } catch (e) {
          Logger.log(`Error updating event ${event.id}: ${e.message}`);
        }
      } else {
        Logger.log(`Event skipped: ${JSON.stringify(event, null, 2)}`);
      }
    });
  } else {
    Logger.log(`No events found for user: ${email}`);
  }
}

/**
 * Tests retrieving users from the domain.
 */
function testGetAllUsers() {
  const users = getAllUsers();
  Logger.log(users);
}

/**
 * Tests processing events for a specific user.
 */
function testAddMeetToUserEvents() {
  const testEmail = 'test@your-domain.com'; // Replace with a valid email
  addMeetToUserEvents(testEmail);
}

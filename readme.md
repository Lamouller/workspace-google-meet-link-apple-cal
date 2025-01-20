# Add Google Meet to events created via Apple Calendar for an entire Workspace

Events created via Apple Calendar – using a Google Workspace or Gmail account - do not include Google Meet link for video conferences (apparently due to a [change in Google Calendar API](https://www.reddit.com/r/gsuite/comments/lnimfi/automatically_adding_google_meet_invite_to_apple/)).

This is a Google Script that runs in the background, checks for new events with attendees and adds Google Meet if no other video conference option is available.

How to:

- Go to https://script.google.com/home
- New Project
- Add Calendar API & Admin SDK API under "Services" 
- Copy/Paste code
- Change : const domain = '_your-domain.com_'; // Replace with your Google Workspace domain
- and run code
- Create a Trigger to programmatically run the script -> `From calendar` - `Calendar updated` [Doc](https://developers.google.com/apps-script/guides/triggers/installable#managing_triggers_manually)

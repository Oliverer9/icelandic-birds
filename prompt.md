# Prompt

Build a single-page website called **Birds of Iceland**.

Put every file you create in one folder, either `a/` or `b/`. I will tell you which one when I start.

## Data and images

- The birds are in `../birds.json` (8 birds). Load the file with JavaScript. Do not copy the data into the HTML.
- Each bird has `id`, `name`, `icelandicName`, `image`, `alt`, `size`, `habitat`, `season`, `description`, `photoCredit`, `photoLicense` and `photoSource`.
- The `image` paths are relative to the project root, so from inside the folder they need `../` in front (for example `../images/lundi.jpg`).

## Design

Follow the style guide in `../style-guide.png` (screenshot attached):

- Font: **Sura** from Google Fonts. Bold for headings, regular for body text.
- Colours: navy `#00165D`, indigo `#272C8D`, grey `#8C8C8C`, light grey `#E4E4E4`, tan `#B49C7B`, light yellow `#FFDB94`, plus the button colours blue `#001EFF`, red `#FF0000` and green `#3CFF00`.
- Buttons: rounded, navy, turning indigo when clicked, like in the style guide.
- The page should work well on both phones and desktops.

## Page layout

- A header with the site name and a navigation menu that links to the sections: **Search**, **Saved birds** and **Sign up**.
- The main content with the sections below.
- A footer with the photo credits (photographer, licence and a link to the source for each photo).

## Section 1: Search and results

- A search field with the label **Search**. Typing filters the birds by English or Icelandic name.
- Show how many birds match, for example "3 birds found".
- Each result shows the bird's name as a heading, its photo, and its Icelandic name.
- Each result has a save button that shows only an icon (a bookmark). Its name must be **Save** followed by the bird's name, for example "Save Atlantic puffin". Clicking it saves or unsaves the bird.
- Saved birds are listed in the **Saved birds** section.

## Section 2: Details dialog

- Clicking a result opens a dialog with more about the bird: a bigger photo, the Icelandic name, size, habitat, season and description.
- The dialog has a button called **Close**. Pressing Escape also closes it.

## Section 3: Sign-up form

The form is for signing up for a bird-watching trip. It has:

- **Name** (required)
- **Email** (required, must be a valid email)
- **Trip**: a choice between Mývatn, Látrabjarg and the Westman Islands (required)
- A checkbox: **I agree to be contacted about the trip** (required)
- A **Sign up** button

Do not show any errors until the user tries to submit. Then show each error as text next to the field it belongs to. When everything is filled in correctly, show a success message.

## Main task

A visitor should be able to: search for a bird, open its details, close them, save the bird, and sign up for a trip.

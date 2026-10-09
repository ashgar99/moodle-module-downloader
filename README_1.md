# Moodle Module Downloader

Download every file from a Moodle module in one go, as a single zip with a folder for each section (Week 1, Week 2, Resources and so on).

No installing, no terminal, no extension. It runs in your browser while you're logged in to Moodle, using a bookmark or a quick paste into the browser console.

Built by a SOAS student who wanted to keep her course materials after graduating. It works on any Moodle 4 site, not just SOAS.

## What you get

```
J400- Advanced Japanese A25-26 (155901470-A25-26).zip
├── 01 Welcome/
├── 02 Module Overview/
│   └── J400 Handbook.pdf
├── 06 Resources/
├── 07 Week 1 Monday/
│   ├── Lesson 1 slides.pdf
│   └── Reading pack/          (Moodle folders keep their own subfolders)
└── ...
```

Sections are numbered so they stay in the same order as on Moodle.

## Option 1: one-click bookmark (easiest)

Set this up once and use it on every module.

1. Open [`bookmarklet.txt`](bookmarklet.txt), click the **Copy raw file** button (the two overlapping squares at the top right of the file).
2. In your browser, show the bookmarks bar (**Cmd + Shift + B** on a Mac, **Ctrl + Shift + B** on Windows).
3. Right-click the bookmarks bar and choose **Add page** (Chrome or Brave) or **Add Bookmark** (Firefox, Edge).
4. Name it **Download Moodle module** and paste what you copied into the **URL** box. Save.
5. Log in to Moodle, open a module's main page, and click the bookmark.

The zip downloads when it's finished. Bigger modules can take a minute or two, so stay on the page until it appears. To watch progress, open the console (see below).

## Option 2: paste into the console

1. Log in to Moodle and open a module's main page (the address will look like `.../course/view.php?id=12345`).
2. Open the browser console: **Cmd + Option + J** on a Mac, or **Ctrl + Shift + J** on Windows (Chrome, Brave or Edge).
3. Copy everything in [`moodle-downloader.js`](moodle-downloader.js) and paste it into the console, then press Enter.
   - If the browser says pasting is blocked, type `allow pasting`, press Enter, and paste again.
4. You'll see it scan each section, add each file, then say **Done**. The zip downloads automatically.

Repeat on each module you want to keep.

## What it does and doesn't download

**Included:** files and Moodle folders from every section of the module.

**Not included:**
- Panopto or other lecture recordings (they're streamed, not files). Check the recording platform for a download button.
- Web links to other sites.
- Your own assignment submissions and feedback. Open each assignment and download these yourself.
- Anything you don't have permission to see.

## Troubleshooting

- **"Found 0 files"**: make sure you're on the module's main page, not a single week or the Dashboard, and that you're logged in.
- **"Could not load JSZip"**: your Moodle site is blocking the zip library from loading. Please open an issue saying which university you're at.
- **Some files say "Skipped"**: those usually point to external links or restricted items. Everything else will still be in the zip.
- **Yellow warnings in the console**: these come from Moodle itself and can be ignored.

## Is it safe?

The whole script is short and readable in [`moodle-downloader.js`](moodle-downloader.js). It only talks to your own Moodle site (using the login you already have) and loads one well-known open-source library, [JSZip](https://stuk.github.io/jszip/), to build the zip. Nothing is sent anywhere else, and your files never leave your computer.

As a rule, only ever paste code into your browser console if you can see what it does or trust where it came from.

## Please use it responsibly

This is for keeping your own copies of materials you already have access to. Course materials usually belong to your lecturers and university, so don't share or republish them, and check your university's IT and copyright policies if you're unsure.

## Credits

Inspired by [harsilspatel/moodle-downloader](https://github.com/harsilspatel/moodle-downloader), a much-loved Chrome extension that is now archived and no longer works with current browsers and Moodle 4. This project is a separate, from-scratch tool rather than a continuation of that code.

Made by [Ash Garnett](https://github.com/ashgar99).

## Licence

[MIT](LICENSE). Improvements and fixes for other universities' Moodle setups are very welcome: open an issue or a pull request.

<p align="center"><img src="docs/logo.svg" width="72" height="72" alt=""></p>
<h3 align="center">Modzip</h3>
<p align="center">Save every file from a Moodle 4 module in one click, as a single zip organised into folders by section.</p>

<p align="center">
  <a href="LICENSE">
    <img alt="MIT licence" src="https://img.shields.io/github/license/ashgar99/moodle-module-downloader?color=brightgreen" />
  </a>
  <img alt="Moodle 4.x" src="https://img.shields.io/badge/Moodle-4.x-orange" />
  <img alt="No installation required" src="https://img.shields.io/badge/install-not%20required-blue" />
</p>

<p align="center"><a href="https://ashgar99.github.io/moodle-module-downloader/"><b>Get Modzip</b></a></p>


## Features ✨

- Downloads every file and folder in a module in one go, not one section at a time.
- Packages everything into a single zip, with a numbered folder for each section so the order matches Moodle.
- Keeps the internal structure of Moodle folders.
- Shows a small progress panel on the page, with the option to cancel at any time.
- Runs in your browser using your existing login. There is no extension or software to install.
- Works in all major desktop browsers: Chrome, Edge, Brave, Arc, Opera, Firefox and Safari.


## Usage 🛠

### Option 1: Bookmarklet (recommended)

Set this up once, then use it on any module with a single click.

1. Go to the [install page](https://ashgar99.github.io/moodle-module-downloader/).
2. Show your bookmarks bar (**Cmd + Shift + B** on macOS, **Ctrl + Shift + B** on Windows). In Safari this is called the Favourites bar.
3. Drag the **Modzip** button onto your bookmarks bar.
4. Log in to Moodle, open the main page of a module and click the bookmark.

If you cannot drag the button, use **Copy the bookmark instead** on the install page, or copy the contents of [`bookmarklet.txt`](bookmarklet.txt), then add a new bookmark and paste it in as the address.

The bookmark shows a plain globe icon. Browsers do not display icons for bookmarklets, so this is expected.

### Option 2: Browser console

1. Log in to Moodle and open the main page of a module (for example `https://moodle.example.ac.uk/course/view.php?id=12345`).
2. Open the developer console: **Cmd + Option + J** on macOS or **Ctrl + Shift + J** on Windows in Chromium browsers, **Cmd + Option + K** or **Ctrl + Shift + K** in Firefox, and **Cmd + Option + C** in Safari (after turning on **Show features for web developers** in Safari's Advanced settings).
3. Paste the contents of [`moodle-downloader.js`](moodle-downloader.js) and press **Enter**.
   - If pasting is blocked, type `allow pasting`, press **Enter**, then paste again.

A progress panel appears in the corner of the page. When it finishes, the zip downloads automatically. Larger modules can take a minute or two, so keep the tab open until the download appears.


## Browser support 🌐

| Browser | Supported | Notes |
| --- | --- | --- |
| Chrome, Edge, Brave, Arc, Opera, Vivaldi | Yes | Fully tested. |
| Firefox | Yes | Drag the button to the bookmarks toolbar. |
| Safari | Yes | Show the Favourites bar first, and allow downloads if Safari asks. |
| Mobile browsers | Not recommended | Bookmarklets are difficult to add and run on phones and tablets. |

If something does not work in your browser, please [open an issue](https://github.com/ashgar99/moodle-module-downloader/issues).


## Output 📁

```
ABC123 Example Module.zip
├── 01 Welcome/
├── 02 Module Overview/
│   └── Module Handbook.pdf
├── 03 Resources/
│   └── Reading List/
│       └── Week 1 Reading.pdf
├── 04 Week 1/
│   └── Lecture Slides.pptx
└── ...
```


## Limitations ⚠️

The following are not included:

- Lecture recordings hosted on external platforms such as Panopto.
- Links to external websites.
- Your own assignment submissions and feedback.
- Any content you do not have permission to view.


## Troubleshooting 🔧

| Problem | Solution |
| --- | --- |
| `Open the main page of a Moodle module` | Make sure you are logged in and on the main module page, not a single section or the Dashboard. |
| `No files were found in this module` | The module may only contain links, recordings or pages rather than files. |
| `Could not load the zip library` | Your Moodle site is blocking the zip library. Please [open an issue](https://github.com/ashgar99/moodle-module-downloader/issues) with your institution's name. |
| A file seems to be missing | External links and restricted items are skipped. All other files are still included. |


## Privacy and security 🔒

The script is short and fully readable in [`moodle-downloader.js`](moodle-downloader.js). It communicates only with your own Moodle site and loads a single open-source library, [JSZip](https://stuk.github.io/jszip/), to build the archive. No data is collected or sent elsewhere.

As a general rule, only run code in your browser console if you understand what it does or trust its source.


## Responsible use 📚

This tool is intended for keeping personal copies of materials you already have access to. Course materials are typically owned by lecturers and institutions, so please do not redistribute them, and check your institution's policies if you are unsure.


## Acknowledgements 👏

Modzip is an independent project and is not affiliated with or endorsed by Moodle.


Inspired by [harsilspatel/moodle-downloader](https://github.com/harsilspatel/moodle-downloader), which is now archived and no longer compatible with current browsers or Moodle 4. This project is an independent implementation and does not reuse its code.


## Development 🧩

The source lives in [`moodle-downloader.js`](moodle-downloader.js). After editing it, run `node build.js` to regenerate `bookmarklet.txt` and the install page in `docs/`.


## Licence 📑

[MIT](LICENSE)

Contributions are welcome, particularly fixes for other institutions' Moodle configurations. Please open an issue or a pull request.

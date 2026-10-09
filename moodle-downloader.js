// Moodle Module Downloader
// Downloads every file in a Moodle 4 module as one zip, organised into folders by section.
// Run it on a module's main page (course/view.php?id=...) while logged in.
// https://github.com/ashgar99/moodle-module-downloader (MIT licence)

(async () => {
  if (document.getElementById('mmd-root')) return;

  // Panel UI, kept in a shadow root so Moodle's styles cannot affect it
  const host = document.createElement('div');
  host.id = 'mmd-root';
  host.style.cssText = 'position:fixed;right:24px;bottom:24px;z-index:2147483647;';
  document.body.appendChild(host);
  const shadow = host.attachShadow({ mode: 'open' });
  shadow.innerHTML = `
    <style>
      .panel { width: 320px; padding: 20px; border-radius: 18px; background: #131317; color: #f5f5f7;
        font: 14px/1.45 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.35); }
      .head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
      .title { font-weight: 600; font-size: 15px; }
      .title span { color: #ff8a3d; }
      .x { background: none; border: 0; color: #8b8b94; font-size: 22px; line-height: 1; cursor: pointer; padding: 0 2px; }
      .x:hover { color: #f5f5f7; }
      .module { color: #a1a1aa; font-size: 13px; margin-bottom: 14px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .status { font-weight: 500; margin-bottom: 10px; }
      .bar { height: 6px; border-radius: 3px; background: #2a2a31; overflow: hidden; }
      .fill { height: 100%; width: 0; background: #ff8a3d; border-radius: 3px; transition: width 0.3s ease; }
      .meta { display: flex; justify-content: space-between; gap: 12px; margin-top: 10px; font-size: 12px; color: #8b8b94; min-height: 17px; }
      .file { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-align: right; }
      .action { margin-top: 16px; width: 100%; padding: 10px; border: 0; border-radius: 999px; background: #24242b;
        color: #f5f5f7; font: inherit; font-weight: 500; cursor: pointer; }
      .action:hover { background: #2f2f37; }
      .panel.done .fill { background: #4ade80; }
      .panel.done .action { background: #ff8a3d; color: #131317; }
      .panel.error .fill { background: #f87171; }
    </style>
    <div class="panel" role="status" aria-live="polite">
      <div class="head"><div class="title">Moodle <span>Downloader</span></div><button class="x" aria-label="Close">&times;</button></div>
      <div class="module"></div>
      <div class="status">Getting ready...</div>
      <div class="bar"><div class="fill"></div></div>
      <div class="meta"><span class="count"></span><span class="file"></span></div>
      <button class="action">Cancel</button>
    </div>`;

  const $ = s => shadow.querySelector(s);
  const ui = {
    status: t => { $('.status').textContent = t; },
    progress: p => { $('.fill').style.width = Math.max(0, Math.min(100, p)) + '%'; },
    count: t => { $('.count').textContent = t; },
    file: t => { $('.file').textContent = t; }
  };
  let cancelled = false;
  let finished = false;
  const close = () => host.remove();
  const finish = (message, state) => {
    finished = true;
    ui.status(message);
    ui.file('');
    if (state) $('.panel').classList.add(state);
    $('.action').textContent = 'Close';
  };
  $('.x').onclick = () => { cancelled = true; close(); };
  $('.action').onclick = () => {
    if (finished) return close();
    cancelled = true;
    ui.status('Cancelling...');
  };
  const check = () => { if (cancelled) throw new Error('cancelled'); };

  // Helpers
  const clean = s => (s || '').replace(/\s+/g, ' ').trim().replace(/[\\/:*?"<>|]/g, '-').slice(0, 80) || 'Untitled';
  const getDoc = async url =>
    new DOMParser().parseFromString(await (await fetch(url, { credentials: 'include' })).text(), 'text/html');
  const main = doc => doc.querySelector('#region-main') || doc;

  try {
    if (!window.M || !/\/course\/view\.php/.test(location.pathname)) {
      ui.progress(100);
      return finish('Open the main page of a Moodle module, then click the bookmark again.', 'error');
    }

    const moduleName = clean(document.querySelector('h1')?.innerText || document.title);
    $('.module').textContent = moduleName;

    // Load JSZip, hiding Moodle's RequireJS loader so the library registers globally
    if (!window.JSZip) {
      ui.status('Loading...');
      const savedDefine = window.define;
      window.define = undefined;
      await new Promise((ok, fail) => {
        const s = document.createElement('script');
        s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
        s.onload = () => { window.define = savedDefine; ok(); };
        s.onerror = () => { window.define = savedDefine; fail(new Error('Could not load the zip library.')); };
        document.head.appendChild(s);
      });
    }
    const zip = new JSZip();

    // Find every section page and its name
    const sections = new Map();
    document.querySelectorAll('a[href*="/course/section.php?id="]').forEach(a => {
      const url = a.href.split('#')[0];
      const name = clean(a.innerText.split('\n')[0]);
      if (!sections.has(url) && name !== 'Untitled') sections.set(url, name);
    });

    // Work out which files and folders sit in which section
    const items = new Map();
    const collect = (root, section) => {
      root.querySelectorAll('a[href*="/mod/resource/view.php?id="], a[href*="/mod/folder/view.php?id="]').forEach(a => {
        const url = a.href.split('#')[0];
        if (!items.has(url)) items.set(url, {
          type: url.includes('/mod/folder/') ? 'folder' : 'file',
          section,
          title: clean(a.innerText.split('\n')[0])
        });
      });
    };
    let i = 0;
    for (const [url, name] of sections) {
      check();
      i++;
      ui.status('Scanning sections');
      ui.count(`${i} of ${sections.size}`);
      ui.file(name);
      ui.progress((i / Math.max(sections.size, 1)) * 15);
      collect(main(await getDoc(url)), `${String(i).padStart(2, '0')} ${name}`);
    }
    collect(document, '00 General');

    if (!items.size) {
      ui.progress(100);
      return finish('No files were found in this module.', 'error');
    }

    // Download everything into the zip
    const added = new Set();
    const addFile = async (url, path) => {
      check();
      const res = await fetch(url, { credentials: 'include' });
      if ((res.headers.get('content-type') || '').includes('text/html')) return;
      const name = decodeURIComponent(new URL(res.url).pathname.split('/').pop()) || 'file';
      ui.file(name);
      let full = `${path}/${name}`;
      let n = 1;
      while (added.has(full)) full = `${path}/${n++}_${name}`;
      added.add(full);
      zip.file(full, await res.blob());
      ui.count(`${added.size} file${added.size === 1 ? '' : 's'}`);
    };
    let done = 0;
    ui.status('Downloading files');
    for (const [url, it] of items) {
      check();
      try {
        if (it.type === 'file') {
          await addFile(url + '&redirect=1', it.section);
        } else {
          const doc = await getDoc(url);
          const links = [...new Set([...main(doc).querySelectorAll('a[href*="/pluginfile.php/"]')].map(a => a.href))];
          for (const f of links) {
            const m = decodeURIComponent(new URL(f).pathname).match(/\/mod_folder\/content\/\d+\/(.*)\/[^/]+$/);
            await addFile(f, `${it.section}/${it.title}${m ? '/' + m[1] : ''}`);
          }
        }
      } catch (e) {
        if (cancelled) throw e;
        console.warn('Moodle Downloader skipped', url, e);
      }
      done++;
      ui.progress(15 + (done / items.size) * 75);
    }

    if (!added.size) {
      ui.progress(100);
      return finish('No downloadable files were found in this module.', 'error');
    }

    // Build and save the zip
    check();
    ui.status('Creating zip');
    ui.file('');
    const blob = await zip.generateAsync({ type: 'blob' }, meta => ui.progress(90 + meta.percent / 10));
    check();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${moduleName}.zip`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 10000);
    ui.progress(100);
    finish(`Done. ${added.size} file${added.size === 1 ? '' : 's'} saved.`, 'done');
  } catch (e) {
    if (cancelled) {
      finish('Cancelled. Nothing was downloaded.');
    } else {
      console.error(e);
      finish(`Something went wrong: ${e.message}`, 'error');
    }
  }
})();

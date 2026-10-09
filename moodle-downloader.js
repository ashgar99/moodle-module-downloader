// Moodle Module Downloader
// Downloads every file in a Moodle 4 module as one zip, organised into folders by section.
// Run it on a module's main page (course/view.php?id=...) while logged in.
// https://github.com/ashgar99/moodle-module-downloader (MIT licence)

(async () => {
  const clean = s => (s || '').replace(/\s+/g, ' ').trim().replace(/[\\/:*?"<>|]/g, '-').slice(0, 80) || 'Untitled';
  const getDoc = async url =>
    new DOMParser().parseFromString(await (await fetch(url, { credentials: 'include' })).text(), 'text/html');
  const main = doc => doc.querySelector('#region-main') || doc;

  if (!window.JSZip) {
    const savedDefine = window.define;
    window.define = undefined;
    await new Promise((ok, fail) => {
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
      s.onload = () => { window.define = savedDefine; ok(); };
      s.onerror = () => { window.define = savedDefine; fail(new Error('Could not load JSZip')); };
      document.head.appendChild(s);
    });
  }

  const moduleName = clean(document.querySelector('h1')?.innerText || document.title);
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
    i++;
    console.log(`Scanning section ${i}/${sections.size}: ${name}`);
    collect(main(await getDoc(url)), `${String(i).padStart(2, '0')} ${name}`);
  }
  collect(document, '00 General');
  console.log(`Found ${items.size} files and folders. Downloading into zip...`);

  // Download everything into the zip
  const added = new Set();
  const addFile = async (url, path) => {
    const res = await fetch(url, { credentials: 'include' });
    if ((res.headers.get('content-type') || '').includes('text/html')) return;
    const name = decodeURIComponent(new URL(res.url).pathname.split('/').pop()) || 'file';
    let full = `${path}/${name}`;
    let n = 1;
    while (added.has(full)) full = `${path}/${n++}_${name}`;
    added.add(full);
    zip.file(full, await res.blob());
    console.log('Added', full);
  };
  for (const [url, it] of items) {
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
      console.warn('Skipped', url, e);
    }
  }

  console.log('Building zip...');
  const blob = await zip.generateAsync({ type: 'blob' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${moduleName}.zip`;
  a.click();
  console.log(`Done: ${added.size} files in ${moduleName}.zip`);
})();

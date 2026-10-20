/**
 * Builds the page that is drawn inside the preview box.
 * Used by BOTH the student editor and the admin viewer, so both look the same.
 */

// The student's page may run its own scripts, but it is walled off from the
// website (there is no "allow-same-origin"), so it cannot touch logins or data.
// "allow-popups-to-escape-sandbox" lets a clicked link (like facebook.com)
// open as a normal tab instead of a restricted one that fails to load.
export const PREVIEW_SANDBOX =
  'allow-scripts allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox';

export function buildPreviewDocument(html: string, css: string): string {
  const raw = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>${css}</style>
</head>
<body>
${html}
</body>
</html>`;

  try {
    // Only web links (https://...) are changed to open in a new tab.
    // In-page links such as href="#about" are left alone.
    const doc = new DOMParser().parseFromString(raw, 'text/html');
    doc.querySelectorAll('a[href]').forEach((a) => {
      const href = (a.getAttribute('href') || '').trim().toLowerCase();
      if (href.startsWith('http://') || href.startsWith('https://')) {
        a.setAttribute('target', '_blank');
        a.setAttribute('rel', 'noopener noreferrer');
      }
    });
    return '<!DOCTYPE html>\n' + doc.documentElement.outerHTML;
  } catch {
    return raw;
  }
}
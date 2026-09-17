import React, { useMemo } from 'react';

interface LivePreviewProps {
  htmlCode: string;
  cssCode: string;
  title?: string;
  isThumbnail?: boolean;
}

export const LivePreview: React.FC<LivePreviewProps> = ({
  htmlCode,
  cssCode,
  title = 'Portfolio Preview',
  isThumbnail = false,
}) => {
  // Combine HTML and CSS safely with <style> injected into <head>
  const srcDoc = useMemo(() => {
    const rawHtml = htmlCode || '';
    const rawCss = cssCode || '';

    // If html already contains <head>, insert <style> into it
    const styleTag = `<style>\n${rawCss}\n</style>`;
    if (rawHtml.toLowerCase().includes('<head>')) {
      return rawHtml.replace(/<head>/i, `<head>\n${styleTag}`);
    } else if (rawHtml.toLowerCase().includes('<html>')) {
      return rawHtml.replace(/<html>/i, `<html><head>\n${styleTag}</head>`);
    } else {
      return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  ${styleTag}
</head>
<body>
  ${rawHtml}
</body>
</html>`;
    }
  }, [htmlCode, cssCode]);

  if (isThumbnail) {
    return (
      <div className="relative w-full h-full overflow-hidden bg-white select-none pointer-events-none">
        <iframe
          title={title}
          srcDoc={srcDoc}
          sandbox=""
          tabIndex={-1}
          aria-hidden="true"
          className="w-[200%] h-[200%] origin-top-left scale-50 border-0 bg-white"
        />
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white flex flex-col overflow-hidden">
      <iframe
        id="portfolio-live-iframe"
        title={title}
        srcDoc={srcDoc}
        sandbox=""
        className="w-full h-full border-0 flex-1 bg-white"
      />
    </div>
  );
};

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "blurText",
    title: "Blur Selected Text",
    contexts: ["selection"]
  });

  chrome.contextMenus.create({
    id: "blurImage",
    title: "Blur This Image",
    contexts: ["image"]
  });

  chrome.contextMenus.create({
    id: "wordCounter",
    title: "Word & Letter Count",
    contexts: ["selection"]
  });

  chrome.contextMenus.create({
    id: "grammarCheck",
    title: "Grammar Check",
    contexts: ["selection"]
  });

  chrome.contextMenus.create({
    id: "detectFont",
    title: "Detect Font Family",
    contexts: ["all"]
  });

  chrome.contextMenus.create({
    id: "responsiveParent",
    title: "Responsive Check",
    contexts: ["page"]
  });

  chrome.contextMenus.create({
    id: "mobileSmall",
    parentId: "responsiveParent",
    title: "Small Mobile (320x568)",
    contexts: ["page"]
  });

  chrome.contextMenus.create({
    id: "mobileView",
    parentId: "responsiveParent",
    title: "Mobile (375x667)",
    contexts: ["page"]
  });

  chrome.contextMenus.create({
    id: "tabletView",
    parentId: "responsiveParent",
    title: "Tablet (768x1024)",
    contexts: ["page"]
  });

  chrome.contextMenus.create({
    id: "laptopView",
    parentId: "responsiveParent",
    title: "Laptop (1366x768)",
    contexts: ["page"]
  });

  chrome.contextMenus.create({
    id: "desktopView",
    parentId: "responsiveParent",
    title: "Desktop (1440x900)",
    contexts: ["page"]
  });

  chrome.contextMenus.create({
    id: "hoverColorPicker",
    title: "Color Picker (Hover Anywhere)",
    contexts: ["page"]
  });



});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (!tab || !tab.url) return;

  if (info.menuItemId === "blurText") {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: () => {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const span = document.createElement("span");
          span.className = "blurred-text";
          span.appendChild(range.extractContents());
          range.insertNode(span);
        }
      }
    });
  }

  if (info.menuItemId === "mobileSmall") {
    chrome.windows.create({
      url: tab.url,
      type: "popup",
      width: 320,
      height: 568,
      left: 100,
      top: 100
    });
  }

  if (info.menuItemId === "mobileView") {
    chrome.windows.create({
      url: tab.url,
      type: "popup",
      width: 375,
      height: 667,
      left: 100,
      top: 100
    });
  }

  if (info.menuItemId === "tabletView") {
    chrome.windows.create({
      url: tab.url,
      type: "popup",
      width: 768,
      height: 1024,
      left: 100,
      top: 100
    });
  }

  if (info.menuItemId === "laptopView") {
    chrome.windows.create({
      url: tab.url,
      type: "popup",
      width: 1366,
      height: 768,
      left: 100,
      top: 100
    });
  }

  if (info.menuItemId === "desktopView") {
    chrome.windows.create({
      url: tab.url,
      type: "popup",
      width: 1440,
      height: 900,
      left: 100,
      top: 100
    });
  }



  if (info.menuItemId === "blurImage") {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      args: [info.srcUrl],
      function: (srcUrl) => {
        const imgs = document.querySelectorAll('img');
        imgs.forEach(img => {
          if (img.src === srcUrl) {
            img.classList.add("blurred-img");
          }
        });
      }
    });
  }

  if (info.menuItemId === "wordCounter") {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: () => {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;

        const text = selection.toString().trim();
        const wordCount = text === "" ? 0 : text.split(/\s+/).length;
        const letterCount = text.replace(/\s/g, "").length;

        const badge = document.createElement("span");
        badge.className = "read-time-badge";
        badge.textContent = `🔠 ${wordCount} words | 🔡 ${letterCount} letters`;

        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        badge.style.position = "absolute";
        badge.style.top = `${rect.bottom + window.scrollY + 5}px`;
        badge.style.left = `${rect.left + window.scrollX}px`;

        document.body.appendChild(badge);

        setTimeout(() => badge.remove(), 5000);
      }
    });
  }

  if (info.menuItemId === "grammarCheck") {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: () => {
        async function checkGrammar(text) {
          try {
            const response = await fetch("https://api.languagetool.org/v2/check", {
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded"
              },
              body: new URLSearchParams({
                text: text,
                language: "en-US"
              })
            });
            return await response.json();
          } catch (error) {
            return { error: error.message };
          }
        }

        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;

        const text = selection.toString().trim();
        if (!text) return;

        checkGrammar(text).then(data => {
          if (data.error) {
            showTooltip(`Error: ${data.error}`);
            return;
          }

          if (data.matches.length === 0) {
            showTooltip("✅ No grammar issues found!");
            return;
          }
        
          const issues = data.matches.slice(0, 3).map(match => {
            const suggestions = match.replacements.length > 0
              ? match.replacements.map(r => r.value).join(", ")
              : "No suggestions";
            return `❌ ${match.message}\nSuggestion: ${suggestions}`;
          }).join("\n\n");

          showTooltip(issues);
        });

        function showTooltip(message) {
          const oldTip = document.querySelector(".grammar-tooltip");
          if (oldTip) oldTip.remove();

          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();

          const tooltip = document.createElement("div");
          tooltip.className = "grammar-tooltip";
          tooltip.textContent = message;
          tooltip.style.position = "absolute";
          tooltip.style.top = `${rect.bottom + window.scrollY + 5}px`;
          tooltip.style.left = `${rect.left + window.scrollX}px`;

          document.body.appendChild(tooltip);

          setTimeout(() => {
            tooltip.style.transition = "opacity 1s ease";
            tooltip.style.opacity = "0";
            setTimeout(() => tooltip.remove(), 1000);
          }, 8000);
        }
      }
    });
  }

  if (info.menuItemId === "detectFont") {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: () => {
        document.addEventListener("mousemove", function handler(e) {
          const el = document.elementFromPoint(e.clientX, e.clientY);
          if (!el) return;

          const computedStyle = window.getComputedStyle(el);
          const font = computedStyle.fontFamily;

          const tooltip = document.createElement("div");
          tooltip.className = "font-detector-tooltip";
          tooltip.textContent = `🔤 Font: ${font}`;
          tooltip.style.position = "fixed";
          tooltip.style.top = `${e.clientY + 10}px`;
          tooltip.style.left = `${e.clientX + 10}px`;
          tooltip.style.background = "rgba(0, 0, 0, 0.75)";
          tooltip.style.color = "#fff";
          tooltip.style.padding = "4px 8px";
          tooltip.style.borderRadius = "5px";
          tooltip.style.fontSize = "12px";
          tooltip.style.zIndex = 99999;
          tooltip.style.pointerEvents = "none";

          document.body.appendChild(tooltip);

          setTimeout(() => {
            tooltip.remove();
            document.removeEventListener("mousemove", handler);
          }, 5000);
        }, { once: true });
      }
    });
  }

  if (info.menuItemId === "hoverColorPicker") {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        document.querySelector(".color-preview-tooltip")?.remove();

        const tooltip = document.createElement("div");
        tooltip.className = "color-preview-tooltip";
        Object.assign(tooltip.style, {
          position: "fixed",
          zIndex: "999999",
          padding: "6px 10px",
          borderRadius: "5px",
          fontSize: "13px",
          fontFamily: "Arial, sans-serif",
          background: "#000",
          color: "#fff",
          boxShadow: "0 0 10px rgba(0,0,0,0.5)",
          pointerEvents: "auto",
          cursor: "pointer"
        });

        tooltip.textContent = "#000000";
        document.body.appendChild(tooltip);

        const rgbToHex = (rgb) => {
          const result = rgb.match(/\d+/g);
          if (!result) return "#000000";
          return (
            "#" +
            result
              .slice(0, 3)
              .map((v) => ("0" + parseInt(v).toString(16)).slice(-2))
              .join("")
          );
        };

        const moveHandler = (e) => {
          const el = document.elementFromPoint(e.clientX, e.clientY);
          let hex = "#000000";

          if (el && el.tagName === "IMG") {
            const img = el;
            const canvas = document.createElement("canvas");
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            const rect = img.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            const x = Math.floor((e.clientX - rect.left) * scaleX);
            const y = Math.floor((e.clientY - rect.top) * scaleY);

            try {
              const pixel = ctx.getImageData(x, y, 1, 1).data;
              hex =
                "#" +
                [pixel[0], pixel[1], pixel[2]]
                  .map((v) => ("0" + v.toString(16)).slice(-2))
                  .join("");
            } catch (err) {
              hex = "#000000";
            }
          } else if (el) {
            const rgb = window.getComputedStyle(el).backgroundColor;
            hex = rgbToHex(rgb);
          }

          tooltip.textContent = hex;
          tooltip.style.background = hex;
          tooltip.style.left = `${e.clientX + 15}px`;
          tooltip.style.top = `${e.clientY + 15}px`;
        };

        const clickHandler = () => {
          const color = tooltip.textContent;
          navigator.clipboard.writeText(color).then(() => {
            tooltip.textContent = `✅ Copied: ${color}`;
          });

          setTimeout(() => {
            tooltip.remove();
            document.removeEventListener("mousemove", moveHandler);
            document.removeEventListener("click", clickHandler);
          }, 3000);
        };

        document.addEventListener("mousemove", moveHandler);
        document.addEventListener("click", clickHandler);
      }
    });
  }


});

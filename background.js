// Holds the data structure for all the context menus used in the app
const TO_ARABIC_SCRIPT = "TO_ARABIC_SCRIPT";
const TO_CYRILLIC_SCRIPT = "TO_CYRILLIC_SCRIPT";
const CONTEXT_MENU_CONTENTS = {
    forWindows: [
        {
            id: TO_ARABIC_SCRIPT,
            title: chrome.i18n.getMessage("contextMenuToArabic")
        },
        {
            id: TO_CYRILLIC_SCRIPT,
            title: chrome.i18n.getMessage("contextMenuToCyrillic")
        }
    ]
};

CONTEXT_MENU_CONTENTS.forWindows.forEach((item) => {
    chrome.contextMenus.create({
        id: item.id,
        title: item.title,
        contexts: ["page", "selection"],
    }, () => {});
})

chrome.contextMenus.onClicked.addListener(function (onclickData) {
    let selectionText = ""
    if (onclickData.selectionText) {
        selectionText = onclickData.selectionText.toString();
    }
    let from, to;
    if (onclickData.menuItemId === TO_ARABIC_SCRIPT) {
        from = 'Cyrillic'
        to = 'Arabic'
    }

    if (onclickData.menuItemId === TO_CYRILLIC_SCRIPT) {
        from = 'Arabic'
        to = 'Cyrillic'
    }

    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        if (tabs.length !== 0)
            chrome.tabs.sendMessage(tabs[0].id, {
                selectionText: selectionText,
                from: from,
                to: to
            }, function (response) {
                console.log(response);
            });
    });
})

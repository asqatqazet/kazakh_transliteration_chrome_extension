// Holds the data structure for all the context menus used in the app
var CONTEXT_MENU_CONTENTS = {
    forWindows: [
        {
            id: "toCyrillicScript",
            title: "Converter: to Kazakh Cyrillic Script",
        },
        {
            id: "toArabicScript",
            title: "Converter: to Kazakh Arabic Script",
        }
    ]
}
CONTEXT_MENU_CONTENTS.forWindows.forEach((item) => {
    chrome.contextMenus.create({
        id: item.id,
        title: item.title,
        contexts: ["page"],
    }, () => {
        console.log(chrome.lastError)
    });
})

chrome.contextMenus.onClicked.addListener(function (onclickData) {
    let from, to;
    if (onclickData.menuItemId === "toArabicScript") {
        from = 'Cyrillic'
        to = 'Arabic'
    }

    if (onclickData.menuItemId === "toCyrillicScript") {
        from = 'Arabic'
        to = 'Cyrillic'
    }

    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        if (tabs.length !== 0)
            chrome.tabs.sendMessage(tabs[0].id, {
                from: from,
                to: to
            }, function (response) {
                console.log(chrome.lastError)
                console.log(response);
            });
    });
})

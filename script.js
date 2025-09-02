document.addEventListener("DOMContentLoaded", function() {
    const DEFAULT_BANNER_URL = 'https://cdn.discordapp.com/attachments/1337202405913399329/1412434670989213706/image.png?ex=68b847cb&is=68b6f64b&hm=8761233763ddcd3f3be457e6c6a3f1e412c94e23eb5121ae234e1d6ea08130a8&';

    const menus = {
        mainMenu: document.getElementById("mainMenu"),
        player: document.getElementById("playerMenu"),
        server: document.getElementById("serverMenu"),
        weapon: document.getElementById("weaponMenu"),
        vehicle: document.getElementById("vehicleMenu"),
        teleport: document.getElementById("teleportMenu"),
        misc: document.getElementById("miscMenu"),
        settings: document.getElementById("settingsMenu"),
        developer: document.getElementById("developerMenu"),
        uiPosition: document.getElementById("uiPositionMenu")
    };

    const menuNames = {
        mainMenu: "Main",
        player: "Player",
        server: "Server",
        weapon: "Weapon",
        vehicle: "Vehicle",
        teleport: "Teleport",
        misc: "Miscellaneous",
        settings: "Settings",
        developer: "Developer",
        uiPosition: "UI Position"
    };

    let currentMenu = menus.mainMenu;
    let selectedIndex = 0;
    let history = [];
    let isAnimating = false;

    const headerBannerImg = document.getElementById('headerBannerImg');
    const menuBox = document.getElementById('menuBox');
    const navPath = document.getElementById('navPath');
    const navCurrent = document.getElementById('navCurrent');
    const externalScrollbar = document.getElementById('externalScrollbar');
    const scrollbarThumb = externalScrollbar.querySelector('.scrollbar-thumb');
    const uiElement = document.querySelector('.ui');
    
    const posXInput = document.getElementById('posX');
    const posYInput = document.getElementById('posY');
    const swipeBar = document.getElementById('swipeBar');
    const swipeHandle = document.getElementById('swipeHandle');
    const applyPositionBtn = document.getElementById('applyPosition');

    let uiPosition = {
        x: localStorage.getItem('uiPosX') ? parseInt(localStorage.getItem('uiPosX')) : 20,
        y: localStorage.getItem('uiPosY') ? parseInt(localStorage.getItem('uiPosY')) : 50
    };
    
    function updateUIPosition() {
        uiElement.style.left = uiPosition.x + 'px';
        uiElement.style.top = uiPosition.y + '%';
        uiElement.style.transform = 'translateY(-50%)';
        
        localStorage.setItem('uiPosX', uiPosition.x);
        localStorage.setItem('uiPosY', uiPosition.y);
        
        posXInput.value = uiPosition.x;
        posYInput.value = uiPosition.y;
        
        updateSwipeHandle();
    }
    
    function updateSwipeHandle() {
        const maxPosition = 250; 
        const percentage = (uiPosition.x / maxPosition) * 100;
        const handlePosition = Math.min(Math.max(percentage, 0), 100);
        
        swipeHandle.style.left = `calc(${handlePosition}% - ${handlePosition * 0.24}px)`;
    }
    
    // Inicializácia swipe baru
    function initSwipeBar() {
        let isDragging = false;
        
        swipeHandle.addEventListener('mousedown', function(e) {
            isDragging = true;
            e.preventDefault();
        });
        
        document.addEventListener('mousemove', function(e) {
            if (!isDragging) return;
            
            const barRect = swipeBar.getBoundingClientRect();
            let position = ((e.clientX - barRect.left) / barRect.width) * 100;
            position = Math.min(Math.max(position, 0), 100);
            
            swipeHandle.style.left = `calc(${position}% - ${position * 0.24}px)`;
            
            uiPosition.x = Math.round((position / 100) * 250);
            posXInput.value = uiPosition.x;
        });
        
        document.addEventListener('mouseup', function() {
            isDragging = false;
        });
        
        swipeBar.addEventListener('click', function(e) {
            const barRect = swipeBar.getBoundingClientRect();
            let position = ((e.clientX - barRect.left) / barRect.width) * 100;
            position = Math.min(Math.max(position, 0), 100);
            
            swipeHandle.style.left = `calc(${position}% - ${position * 0.24}px)`;
            
            uiPosition.x = Math.round((position / 100) * 250);
            posXInput.value = uiPosition.x;
        });
        
        updateSwipeHandle();
    }
    
    posXInput.addEventListener('change', function() {
        uiPosition.x = parseInt(this.value) || 20;
        updateUIPosition();
    });
    
    posYInput.addEventListener('change', function() {
        uiPosition.y = parseInt(this.value) || 50;
        updateUIPosition();
    });
    
    applyPositionBtn.addEventListener('click', function() {
        updateUIPosition();
    });

    function getCurrentList() {
        return currentMenu.querySelector('.menu-list');
    }

    function setHeaderBanner(url) {
        headerBannerImg.src = url || DEFAULT_BANNER_URL;
    }

    function updateNavigation() {
        if (history.length === 0) {
            navPath.textContent = "Main";
            navCurrent.textContent = " › Main";
            return;
        }
        
        let path = "Main";
        let currentName = "";
        
        for (const [key, value] of Object.entries(menus)) {
            if (value === currentMenu) {
                currentName = menuNames[key];
                break;
            }
        }
        
        if (history.length > 0) {
            const lastMenu = history[history.length - 1];
            for (const [key, value] of Object.entries(menus)) {
                if (value === lastMenu) {
                    path = menuNames[key];
                    break;
                }
            }
        }
        
        navPath.textContent = path;
        navCurrent.textContent = ` › ${currentName}`;
    }

    function updateSelection() {
        const menuItems = currentMenu.querySelectorAll('.menu-list li');
        document.querySelectorAll('.menu-list li.selected').forEach(el => el.classList.remove('selected'));
        if (menuItems.length > 0) {
            menuItems[selectedIndex].classList.add('selected');
            menuItems[selectedIndex].scrollIntoView({ block: 'nearest' });
        }
        updateExternalScrollbar();
    }

    function updateExternalScrollbar() {
        const menuItems = currentMenu.querySelectorAll('.menu-list li');
        
        if (menuItems.length === 0) return;
        
        const itemHeight = menuItems[0].offsetHeight;
        const visibleItems = Math.min(menuItems.length, parseInt(getComputedStyle(document.documentElement).getPropertyValue('--max-visible-items')));
        const totalHeight = menuItems.length * itemHeight;
        const visibleHeight = visibleItems * itemHeight;
        
        const thumbHeight = Math.max(20, (visibleHeight / totalHeight) * visibleHeight);
        const maxScroll = totalHeight - visibleHeight;
        const scrollPosition = Math.min(selectedIndex * itemHeight, maxScroll);
        const thumbPosition = maxScroll > 0 ? (scrollPosition / maxScroll) * (visibleHeight - thumbHeight) : 0;
        
    
        scrollbarThumb.style.height = thumbHeight + 'px';
        scrollbarThumb.style.top = thumbPosition + 'px';
    }

    function resizeMenu() {
        const list = currentMenu.querySelector('.menu-list');
        if (!list) return;
        
        if (currentMenu.id === 'mainMenu') {
            const cs = window.getComputedStyle(menuBox);
            const pt = parseFloat(cs.paddingTop) || 0;
            const pb = parseFloat(cs.paddingBottom) || 0;
            const targetH = Math.round(parseInt(getComputedStyle(document.documentElement).getPropertyValue('--item-height')) * parseInt(getComputedStyle(document.documentElement).getPropertyValue('--max-visible-items')) + pt + pb);
            menuBox.style.height = targetH + 'px';
        } else {
            const items = list.querySelectorAll('li');
            if (items.length === 0) return;

            const itemHeight = items[0].getBoundingClientRect().height;
            const cs = window.getComputedStyle(menuBox);
            const pt = parseFloat(cs.paddingTop) || 0;
            const pb = parseFloat(cs.paddingBottom) || 0;

            const targetH = Math.round(itemHeight * items.length + pt + pb);
            menuBox.style.height = targetH + 'px';
        }
        
        updateExternalScrollbar();
    }

    function showMenu(menuId) {
        if (isAnimating) return;
        isAnimating = true;
        
        currentMenu.classList.add('animate-out');
        
        setTimeout(() => {
            currentMenu.classList.add('hidden');
            currentMenu.classList.remove('animate-out');
            
            history.push(currentMenu);
            currentMenu = menus[menuId];
            currentMenu.classList.remove('hidden');
            currentMenu.classList.add('animate-in');
            
            setTimeout(() => {
                currentMenu.classList.remove('animate-in');
                isAnimating = false;
            }, 300);

            selectedIndex = 0;
            updateSelection();
            resizeMenu();
            updateNavigation();

            const newList = getCurrentList();
            if (newList) newList.scrollTop = 0;
        }, 300);
    }

    function handleBack() {
        if (isAnimating || history.length === 0) return;
        isAnimating = true;
        
        // Pridaj animáciu pre odchod
        currentMenu.classList.add('animate-out');
        
        setTimeout(() => {
            currentMenu.classList.add('hidden');
            currentMenu.classList.remove('animate-out');
            
            currentMenu = history.pop();
            currentMenu.classList.remove('hidden');
            currentMenu.classList.add('animate-in');
            
            setTimeout(() => {
                currentMenu.classList.remove('animate-in');
                isAnimating = false;
            }, 300);

            selectedIndex = 0;
            updateSelection();
            resizeMenu();
            updateNavigation();

            const newList = getCurrentList();
            if (newList) newList.scrollTop = 0;
        }, 300);
    }

    window.addEventListener('message', function(event) {
        const data = event.data || {};
        const menuItems = currentMenu.querySelectorAll('.menu-list li');

        if (data.action === 'navigate') {
            if (menuItems.length === 0) return;
            selectedIndex = data.direction === 'up'
                ? (selectedIndex - 1 + menuItems.length) % menuItems.length
                : (selectedIndex + 1) % menuItems.length;
            updateSelection();
        } else if (data.action === 'select') {
            if (menuItems.length === 0) return;
            const selectedItem = menuItems[selectedIndex];
            const action = selectedItem.getAttribute('data-action');

            if (action.startsWith('show-')) {
                showMenu(action.replace('show-', ''));
            } else if (action.startsWith('toggle-')) {
                const checkbox = selectedItem.querySelector("input[type='checkbox']");
                if (checkbox) {
                    checkbox.checked = !checkbox.checked;
                    window.MachoSendLuaMessage(JSON.stringify({ event: 'toggle', action: action.replace('toggle-', ''), state: checkbox.checked }));
                }
            } else if (action === 'ui-position') {
                showMenu('uiPosition');
            } else if (action === 'reset-ui-position') {
                uiPosition = { x: 20, y: 50 };
                updateUIPosition();
            } else {
                window.MachoSendLuaMessage(JSON.stringify({ event: 'menuAction', action: action }));
            }
        } else if (data.action === 'back') {
            handleBack();
        } else if (data.action === 'setHeaderBanner') {
            setHeaderBanner(data.url);
        }
    });

// test Prvy callback 


else if (data.event === 'toggle') {
    if (data.action === 'noclip') {
        const checkbox = document.getElementById('noclipToggle');
        if (checkbox) {
            checkbox.checked = data.state;
            window.MachoSendLuaMessage(JSON.stringify({ 
                event: 'checkboxToggle', 
                id: 'noclipToggle', 
                state: data.state 
            }));
        }
    }
}

    // Inicializácia
    updateSelection();
    updateNavigation();
    setHeaderBanner(DEFAULT_BANNER_URL);
    resizeMenu();
    updateUIPosition();
    initSwipeBar();
    window.addEventListener('resize', resizeMenu);
});

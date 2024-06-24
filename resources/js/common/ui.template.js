document.addEventListener('DOMContentLoaded', function () {
  // loadHeader();
  // loadFooter();
  loadLnb();

  function loadHeader() {
    fetch('../common/header.html')
      .then(response => response.text())
      .then(html => {
        const header = document.querySelector('.base-header');
        if (header && !header.innerHTML.trim()) {
          header.innerHTML = html;
        }
      });
  }

	function loadFooter() {
    fetch('../common/footer.html')
      .then(response => response.text())
      .then(html => {
        const header = document.querySelector('.base-footer');
        if (header && !header.innerHTML.trim()) {
          header.innerHTML = html;
        }
      });
  }

  function loadLnb() {
    const body = document.body;
    const route = body.dataset.route;
    const lnbIndex = parseInt(body.dataset.lnbIndex, 10);
    const subItemIndex = parseInt(body.dataset.subLnbIndex, 10);

    if (route) {
      showFocusedLnb(route, () => {
        initActiveItems(lnbIndex, subItemIndex);
      });
    } else {
      initActiveItems(lnbIndex, subItemIndex);
    }
  }
});

function showFocusedLnb(route, callback) {
  const sidebar = document.querySelector(".base-aside");
  const filePath = "../common/lnb.html";

  fetch(filePath)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
      }
      return response.text();
    })
    .then(html => {
      if (sidebar && !sidebar.innerHTML.trim()) {
        sidebar.innerHTML = html;
        const pathArr = route.split(" ");
        filterLnbByClasses(pathArr);
        lnbInit();
        if (callback) callback();
      }
    })
    .catch(error => {
      console.error('There has been a problem with your fetch operation:', error);
    });
}

function filterLnbByClasses(classes) {
  const allLnbs = document.querySelectorAll('.lnb');
  allLnbs.forEach(lnb => {
    let shouldShow = classes.every(className => lnb.classList.contains(className));
    lnb.classList.toggle('is-active', shouldShow);
  });
}

function initActiveItems(lnbIndex, subItemIndex) {
  lnbActive(lnbIndex, subItemIndex);
}

function lnbActive(lnbIndex, subItemIndex) {
  const lnbItems = document.querySelectorAll('.lnb-item');
  if (lnbItems[lnbIndex]) {
    lnbItems[lnbIndex].classList.add('is-active', 'is-extend');
  }
  const subItems = document.querySelectorAll('.lnb-subItem');
  if (subItems[subItemIndex]) {
    subItems[subItemIndex].classList.add('is-active');
  }
}

function lnbInit() {

  document.querySelectorAll('.lnb-link').forEach(item => {
    item.addEventListener('click', function (event) {
      const lnbItem = item.closest('.lnb-item');
      const hasSubMenu = lnbItem.querySelector('.lnb-sub');
      const href = item.getAttribute('href');

      // 하위 메뉴가 있는 경우 서브 메뉴 토글
      if (hasSubMenu) {
        event.preventDefault();
        toggleSubMenu(lnbItem);
      } else if (href && href !== '#') {
        // 하위 메뉴가 없는 경우
        if (!lnbItem.classList.contains('is-active')) {
          document.querySelectorAll('.lnb-item').forEach(lnb => {
            lnb.classList.remove('is-active');
          });
          lnbItem.classList.add('is-active');
        }
      }
    });
  });
}

function addNoneClassToItems() {
  document.querySelectorAll('.lnb-item').forEach(item => {
    if (!item.querySelector('.lnb-sub')) {
      item.classList.add('is-none');
    }
  });
}

function toggleSubMenu(lnbItem) {
  const subMenu = lnbItem.querySelector('.lnb-sub');
  const isExpanded = lnbItem.classList.contains('is-extend');

  document.querySelectorAll('.lnb-item').forEach(item => {
    item.classList.remove('is-active', 'is-extend');
    const itemSubMenu = item.querySelector('.lnb-sub');
    if (itemSubMenu) {
      itemSubMenu.style.height = '0';
    }
  });

  if (!isExpanded && subMenu) {
    openSubMenu(lnbItem, subMenu);
    lnbItem.classList.add('is-active');
  }
}

function openSubMenu(lnbItem, subMenu) {
  if (subMenu) {
    lnbItem.classList.add('is-extend');
    subMenu.style.height = subMenu.scrollHeight + 'px';
    subMenu.addEventListener('transitionend', () => {
      subMenu.style.height = 'auto';
    }, { once: true });
  }
}

function closeSubMenu(lnbItem) {
  const subMenu = lnbItem.querySelector('.lnb-sub');
  if (subMenu) {
    subMenu.style.height = subMenu.scrollHeight + 'px';
    requestAnimationFrame(() => {
      subMenu.style.height = '0px';
    });
    subMenu.addEventListener('transitionend', () => {
      lnbItem.classList.remove('is-extend');
      subMenu.style.height = '';
    }, { once: true });
  }
}

// load
document.addEventListener("DOMContentLoaded", () => {
  const baseWrap = document.querySelector('.base-wrap');
  const baseFooter = document.querySelector('.base-footer');

  if (baseWrap && !baseFooter) {
      baseWrap.classList.add('nofooter');
  }
});

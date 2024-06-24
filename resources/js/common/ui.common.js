// Tab
class TabManager {
  constructor() {
    this.initTabs();
  }

  initTabs() {
    document.addEventListener('click', (e) => {
      const target = e.target.closest(".tab-link");
      if (target && target.getAttribute("href") === "#") {
        e.preventDefault();
        this.handleTabClick(target);
      }
    });
  }

  handleTabClick(target) {
    const tabContentId = target.dataset.tab;
    const tabList = target.closest(".ui-tab");

    tabList.querySelectorAll(".tab-item").forEach(item => {
      item.classList.remove("is-active");
    });
    target.closest(".tab-item").classList.add("is-active");

    document.querySelectorAll(".tab-content").forEach(content => {
      content.classList.remove("is-active");
      if (content.getAttribute("data-tab-content") === tabContentId) {
        content.classList.add("is-active");
      }
    });
  }
}

// textarea byte
function initByteTextarea(textareaId, byteCountId, maxLength) {
  const textarea = document.getElementById(textareaId);
  const byteCount = document.getElementById(byteCountId);

  const updateByteCount = () => {
      const text = textarea.value;
      const bytes = new TextEncoder().encode(text).length;

      if (bytes > maxLength) {
          textarea.value = new TextDecoder().decode(new TextEncoder().encode(text).slice(0, maxLength));
      }

      byteCount.textContent = bytes <= maxLength ? bytes : maxLength;
  };

  textarea.addEventListener("keydown", (event) => {
      if (textarea.selectionStart === 0 && event.key === ' ') {
          event.preventDefault();
      }

      setTimeout(updateByteCount, 0);
  });

  textarea.addEventListener("input", updateByteCount);

  // textarea.focus();
}

// 이미지 업로드 초기화 함수
function initPhotoRegistration(config) {
  const registerBtn = document.getElementById(config.registerBtnId); // 등록 버튼
  const submitBtn = document.getElementById(config.submitBtnId); // cta 전송 버튼
  const thumbnailContainer = document.getElementById(config.thumbnailContainerId);
  const maxPhotos = config.maxPhotos;
  const lengthSpan = registerBtn.querySelector(".length-txt");
  const currentCountSpan = registerBtn.querySelector(".current");
  const addIcon = registerBtn.querySelector(".ico-add");
  const validExtensions = config.validExtensions || ['jpg', 'jpeg', 'png', 'svg']; // 허용 확장자

  let photos = [];
  let photoToDeleteIndex = null;

  lengthSpan.style.display = "none";

  registerBtn.addEventListener("click", handleRegisterClick);
  submitBtn.addEventListener("click", handleSubmitClick);

  function handleRegisterClick() {
    if (photos.length < maxPhotos) {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = validExtensions.map(ext => `image/${ext}`).join(',');
      input.onchange = handleFileChange;
      input.click();
    }
  }

  function handleFileChange(event) {
    const file = event.target.files[0];
    if (file && isValidExtension(file.name)) {
      const reader = new FileReader();
      reader.onload = (e) => {
        photos.push(e.target.result);
        updateThumbnails();
        toggleSubmitButton();
        updatePhotoCount();
      };
      reader.readAsDataURL(file);
    } else {
      alert(`Invalid file type. Only the following extensions are allowed: ${validExtensions.join(', ')}`);
    }
  }

  function isValidExtension(filename) {
    const extension = filename.split('.').pop().toLowerCase();
    return validExtensions.includes(extension);
  }

  function updateThumbnails() {
    thumbnailContainer.innerHTML = photos.map((photo, index) => `
      <div class="thumbnail">
        <img src="${photo}" alt="Thumbnail">
        <button class="delete-btn" data-index="${index}"></button>
      </div>
    `).join('');

    document.querySelectorAll(".delete-btn").forEach(btn => {
      btn.addEventListener("click", handleDeleteButtonClick);
    });

    registerBtn.classList.toggle("disabled", photos.length >= maxPhotos);
  }

  function handleDeleteButtonClick(event) {
    photoToDeleteIndex = event.target.getAttribute("data-index");
    // 네이티브 팝업 호출
    if (window.NativeInterface && window.NativeInterface.showDeletePopup) {
      window.NativeInterface.showDeletePopup(photoToDeleteIndex);
    } else {
      alert("Native interface not available");
    }
  }

  // 네이티브에서 호출할 함수
  window.handleDeletePhoto = function(index) {
    photos.splice(index, 1);
    updateThumbnails();
    toggleSubmitButton();
    updatePhotoCount();
  }

  function toggleSubmitButton() {
    submitBtn.disabled = photos.length === 0;
  }

  function updatePhotoCount() {
    currentCountSpan.textContent = photos.length;
    const hasPhotos = photos.length > 0;
    lengthSpan.style.display = hasPhotos ? "inline" : "none";
    addIcon.style.display = hasPhotos ? "none" : "inline";
  }

  // 네이티브 CTA 버튼 클릭 시 호출될 함수
  function handleSubmitClick() {
    if (window.NativeInterface && window.NativeInterface.submitPhotos) {
      window.NativeInterface.submitPhotos(photos);
    } else {
      alert("Native interface not available");
    }
  }

  // 초기 상태 설정
  toggleSubmitButton();
  updatePhotoCount();
}

class ApplicationInit {
  constructor() {
    document.addEventListener('DOMContentLoaded', () => {
      this.initComponents();
    });
  }

  initComponents() {
    this.tabManager = new TabManager();
  }
}

// 애플리케이션 초기화
new ApplicationInit();
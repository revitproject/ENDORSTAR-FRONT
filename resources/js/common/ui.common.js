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

// textarea byte 체크
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

// 휴대폰번호 입력 포맷팅
function formatPhoneNumber(inputElement) {
  inputElement.addEventListener('input', function (event) {
    let value = event.target.value.replace(/[^0-9]/g, ''); // 숫자 이외의 문자 제거
    if (value.length > 11) {
      value = value.slice(0, 11); // 최대 11자리 숫자까지만 허용
    }
    if (value.length > 3 && value.length <= 7) {
      value = value.replace(/(\d{3})(\d{1,4})/, '$1-$2');
    } else if (value.length > 7) {
      value = value.replace(/(\d{3})(\d{4})(\d{1,4})/, '$1-$2-$3');
    }
    event.target.value = value;
  });
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
      // 사진 삭제 안내 모달 웹뷰 확인용 스크립트
      console.log("Native interface not available");

      const deletePopup = document.getElementById(config.deletePopupId);
      const closePopupBtn = document.getElementById(config.closePopupBtnId);
      const deletePhotoBtn = document.getElementById(config.deletePhotoBtnId);
  
      deletePopup.style.display = "flex";
  
      // 삭제 버튼 클릭 이벤트
      deletePhotoBtn.onclick = function () {
        window.handleDeletePhoto(photoToDeleteIndex);
        deletePopup.style.display = "none";
      };
  
      // 닫기 버튼 클릭 이벤트
      closePopupBtn.onclick = function () {
        deletePopup.style.display = "none"; 
      };
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

// 입력 필드 포커스
document.querySelectorAll('.inp-base').forEach(input => {
  input.addEventListener('focus', (event) => {
    const parentWrapper = event.target.closest('.wrap-inp');
    if (parentWrapper) {
      parentWrapper.classList.add('is-focus');
    }
  });

  input.addEventListener('blur', (event) => {
    const parentWrapper = event.target.closest('.wrap-inp');
    if (parentWrapper) {
      parentWrapper.classList.remove('is-focus');
    }
  });
});

class ApplicationInit {
  constructor() {
    document.addEventListener('DOMContentLoaded', () => {
      this.initComponents();
    });
  }
  
  initComponents() {
    this.tabManager = new TabManager();
    this.initAccordion();
  }

  // 아코디언
  initAccordion() {
    const accordions = document.querySelectorAll('.wrap-accordion');
    const header = document.querySelector('header'); // 고정된 header 요소 선택
  
    accordions.forEach(accordion => {
      const btn = accordion.querySelector('.btn-ico');
      const panel = accordion.querySelector('.accordion-panel');
      const head = accordion.querySelector('.accordion-head');
  
      btn.addEventListener('click', function () {
        const isOpen = accordion.classList.contains('open');
  
        // 모든 아코디언을 닫기
        accordions.forEach(acc => {
          const otherPanel = acc.querySelector('.accordion-panel');
          const otherBtn = acc.querySelector('.btn-ico');
          if (acc !== accordion) {
            acc.classList.remove('open');
            otherPanel.style.maxHeight = null;
            otherBtn.setAttribute('aria-expanded', 'false');
          }
        });
  
        // 현재 아코디언 열기/닫기
        if (isOpen) {
          accordion.classList.remove('open');
          panel.style.maxHeight = null;
        } else {
          accordion.classList.add('open');
          panel.style.maxHeight = panel.scrollHeight + "px";
  
          // 스크롤 애니메이션 추가
          const headerHeight = header ? header.offsetHeight : 0; // header 높이 계산
          const offsetTop = head.getBoundingClientRect().top + window.scrollY - headerHeight;
          window.scrollTo({ top: offsetTop, behavior: 'smooth' });
        }
        btn.setAttribute('aria-expanded', !isOpen);
      });
    });
  }  
}

// 인스턴스 생성 UI 컴포넌트 관리
new ApplicationInit();
// 1. 요소 가져오기
const submitBtn = document.getElementById('submitBtn');
const commentInput = document.getElementById('commentInput');
const commentList = document.getElementById('commentList');

// [추가] 페이지가 열리면 저장된 댓글 불러오기
window.onload = function() {
    const savedComments = JSON.parse(localStorage.getItem('myComments')) || [];
    savedComments.forEach(text => {
        renderComment(text);
    });
};

// 2. 등록 버튼 클릭 이벤트
submitBtn.addEventListener('click', function() {
    const text = commentInput.value;
    if (text.trim() === "") {
        alert("내용을 입력해주세요!");
        return;
    }

    // 화면에 그리고 저장하기
    renderComment(text);
    saveComment(text);

    commentInput.value = "";
});

// [추가] 화면에 댓글을 그려주는 함수
function renderComment(text) {
    const newComment = document.createElement('div');
    newComment.className = "bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-4";
    newComment.innerHTML = `
        <div class="flex items-center gap-2 mb-2">
            <span class="font-bold text-sm" style="color: #00B5E2;">익명의 청년</span>
            <span class="text-xs text-gray-400">방금 전</span>
        </div>
        <p class="text-gray-700 text-sm">${text}</p>
    `;
    commentList.prepend(newComment);
}

// [추가] LocalStorage에 댓글을 저장하는 함수
function saveComment(text) {
    const savedComments = JSON.parse(localStorage.getItem('myComments')) || [];
    savedComments.push(text);
    localStorage.setItem('myComments', JSON.stringify(savedComments));
}
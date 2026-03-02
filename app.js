const submitBtn = document.getElementById('submitBtn');
const commentInput = document.getElementById('commentInput');
const commentList = document.getElementById('commentList');

window.onload = function() {
    const savedComments = JSON.parse(localStorage.getItem('myComments')) || [];
    savedComments.forEach(text => {
        renderComment(text);
    });
};

submitBtn.addEventListener('click', function() {
    const text = commentInput.value;
    if (text.trim() === "") {
        alert("내용을 입력해주세요!");
        return;
    }
    renderComment(text);
    saveComment(text);
    commentInput.value = "";
});

function renderComment(text) {
    const newComment = document.createElement('div');
    newComment.className = "bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-4";
    newComment.innerHTML = `
        <div class="flex items-center gap-2 mb-2">
            <span class="font-bold text-sm" style="color: #E61E2B;">익명의 청년</span>
            <span class="text-xs text-gray-400">방금 전</span>
        </div>
        <p class="text-gray-700 text-sm">${text}</p>
    `;
    commentList.prepend(newComment);
}

function saveComment(text) {
    const savedComments = JSON.parse(localStorage.getItem('myComments')) || [];
    savedComments.push(text);
    localStorage.setItem('myComments', JSON.stringify(savedComments));
}

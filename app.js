// 1. Supabase 설정 (사장님의 주소와 키입니다)
const SUPABASE_URL = 'https://hpxbybfwgchdrkxoqwph.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhweGJ5YmZ3Z2NoZHJreG9xd3BoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0NTA0MDksImV4cCI6MjA4ODAyNjQwOX0.pA_Ssa5kedLbS1pDDsEkIBkmKrIJ6h0-D4iDT8jKq6w';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const submitBtn = document.getElementById('submitBtn');
const commentInput = document.getElementById('commentInput');
const commentList = document.getElementById('commentList');

let isAdmin = false; // 관리자 여부 상태

// 페이지 열리면 댓글 목록 가져오기
window.onload = async () => {
    await fetchComments();
};

// 관리자 모드 토글 함수
function toggleAdminMode() {
    const password = prompt("관리자 비밀번호를 입력하세요.");
    if (password === "2028") { // 비밀번호는 사장님 목표 연도인 2028입니다!
        isAdmin = !isAdmin;
        alert(isAdmin ? "관리자 모드가 활성화되었습니다." : "관리자 모드가 해제되었습니다.");
        fetchComments(); // 버튼 표시를 위해 목록 새로고침
    } else {
        alert("비밀번호가 틀렸습니다.");
    }
}

// 댓글 가져오기 함수 (좋아요 순으로 가져오고 싶으면 order를 바꿀 수 있습니다)
async function fetchComments() {
    const { data, error } = await _supabase
        .from('comments')
        .select('*')
        .order('created_at', { ascending: false }); // 최신순 정렬

    if (!error && data) {
        commentList.innerHTML = ''; 
        data.forEach(item => {
            renderComment(item);
        });
    }
}

// 댓글 삭제 함수
async function deleteComment(id) {
    if (!confirm("이 댓글을 정말 삭제하시겠습니까?")) return;
    
    const { error } = await _supabase
        .from('comments')
        .delete()
        .eq('id', id);
        
    if (error) {
        alert("삭제 실패: " + error.message);
    } else {
        await fetchComments();
    }
}

// 좋아요 버튼 클릭 시 실행되는 함수
async function addLike(id, currentLikes) {
    const { error } = await _supabase
        .from('comments')
        .update({ likes: (currentLikes || 0) + 1 }) // 1 더하기
        .eq('id', id);
    
    if (error) {
        console.error("좋아요 실패:", error.message);
    } else {
        await fetchComments(); // 숫자가 바뀌었으니 목록 다시 불러오기
    }
}

// 댓글 등록 버튼 클릭 이벤트
submitBtn.addEventListener('click', async () => {
    const text = commentInput.value;
    if (!text.trim()) {
        alert("내용을 입력해주세요!");
        return;
    }

    const { error } = await _supabase
        .from('comments')
        .insert([{ content: text, likes: 0 }]); // 새 댓글은 좋아요 0개부터 시작

    if (error) {
        alert("저장 실패: " + error.message);
    } else {
        commentInput.value = "";
        await fetchComments();
    }
});

// 화면에 댓글 그리는 함수
function renderComment(item) {
    const date = new Date(item.created_at).toLocaleString('ko-KR', { hour12: false }).slice(5, 16);
    const newComment = document.createElement('div');
    newComment.className = "bg-white p-4 rounded-xl border border-gray-200 shadow-sm animate-fade-in mb-4";
    
    // 관리자일 때만 삭제 버튼이 보이도록 함
    const deleteBtn = isAdmin ? `<button onclick="deleteComment(${item.id})" class="text-red-400 hover:text-red-600 text-xs mr-2 transition-colors">삭제</button>` : '';

    newComment.innerHTML = `
        <div class="flex items-center justify-between mb-2">
            <span class="font-bold text-sm" style="color: #E61E2B;">익명의 청년</span>
            <span class="text-[10px] text-gray-400">${date}</span>
        </div>
        <p class="text-gray-700 text-sm mb-3 leading-relaxed">${item.content}</p>
        <div class="flex justify-between items-center">
            <div>${deleteBtn}</div>
            
            <button onclick="addLike(${item.id}, ${item.likes || 0})" 
                class="flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full border border-gray-200 hover:bg-red-50 hover:text-red-500 transition-all active:scale-90 shadow-sm">
                <span>❤️</span>
                <span>${item.likes || 0}</span>
            </button>
        </div>
    `;
    commentList.appendChild(newComment);
}

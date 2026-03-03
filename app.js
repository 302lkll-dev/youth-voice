// 1. Supabase 설정 (유지)
const SUPABASE_URL = 'https://hpxbybfwgchdrkxoqwph.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhweGJ5YmZ3Z2NoZHJreG9xd3BoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0NTA0MDksImV4cCI6MjA4ODAyNjQwOX0.pA_Ssa5kedLbS1pDDsEkIBkmKrIJ6h0-D4iDT8jKq6w';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const submitBtn = document.getElementById('submitBtn');
const commentInput = document.getElementById('commentInput');
const commentList = document.getElementById('commentList');

// 페이지 로드 시 DB에서 댓글 가져오기
window.onload = async function() {
    await fetchComments();
};

async function fetchComments() {
    const { data, error } = await _supabase
        .from('comments')
        .select('*')
        .order('created_at', { ascending: false });

    if (!error && data) {
        commentList.innerHTML = ''; 
        data.forEach(item => {
            // item 전체를 넘겨서 id와 likes를 사용할 수 있게 합니다.
            renderComment(item);
        });
    }
}

submitBtn.addEventListener('click', async function() {
    const text = commentInput.value;
    if (!text.trim()) return alert("내용을 입력해주세요!");

    // DB에 저장 (초기 좋아요 0개 설정)
    const { error } = await _supabase
        .from('comments')
        .insert([{ content: text, likes: 0 }]);

    if (error) {
        alert("저장 실패: " + error.message);
    } else {
        commentInput.value = "";
        await fetchComments(); // 목록 갱신
    }
});

// [추가] 좋아요 숫자를 올리는 함수
async function addLike(id, currentLikes) {
    const { error } = await _supabase
        .from('comments')
        .update({ likes: (currentLikes || 0) + 1 })
        .eq('id', id);
    
    if (error) {
        console.error("좋아요 실패:", error.message);
    } else {
        await fetchComments(); // 성공하면 목록 새로고침
    }
}

// [수정] renderComment 함수에서 버튼도 함께 그립니다.
function renderComment(item) {
    const date = new Date(item.created_at).toLocaleString('ko-KR', { hour12: false }).slice(5, 16);
    const newComment = document.createElement('div');
    newComment.className = "bg-white p-4 rounded-xl border border-gray-200 shadow-sm animate-fade-in mb-4";
    newComment.innerHTML = `
        <div class="flex items-center justify-between mb-2">
            <span class="font-bold text-sm" style="color: #E61E2B;">익명의 청년</span>
            <span class="text-[10px] text-gray-400">${date}</span>
        </div>
        <p class="text-gray-700 text-sm leading-relaxed mb-3">${item.content}</p>
        <div class="flex justify-end">
            <button onclick="addLike(${item.id}, ${item.likes || 0})" 
                class="flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full border border-gray-200 hover:bg-red-50 hover:text-red-500 transition-all active:scale-90">
                <span>❤️</span>
                <span>${item.likes || 0}</span>
            </button>
        </div>
    `;
    commentList.appendChild(newComment);
}

// 1. Supabase 설정 (주신 정보를 적용했습니다)
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
            renderComment(item.content, item.created_at);
        });
    }
}

submitBtn.addEventListener('click', async function() {
    const text = commentInput.value;
    if (!text.trim()) return alert("내용을 입력해주세요!");

    // DB에 저장
    const { error } = await _supabase
        .from('comments')
        .insert([{ content: text }]);

    if (error) {
        alert("저장 실패: " + error.message);
    } else {
        commentInput.value = "";
        await fetchComments(); // 목록 갱신
    }
});

function renderComment(text, time) {
    const date = new Date(time).toLocaleString('ko-KR', { hour12: false }).slice(5, 16);
    const newComment = document.createElement('div');
    newComment.className = "bg-white p-4 rounded-xl border border-gray-200 shadow-sm animate-fade-in";
    newComment.innerHTML = `
        <div class="flex items-center justify-between mb-2">
            <span class="font-bold text-sm" style="color: #E61E2B;">익명의 청년</span>
            <span class="text-[10px] text-gray-400">${date}</span>
        </div>
        <p class="text-gray-700 text-sm leading-relaxed">${text}</p>
    `;
    commentList.appendChild(newComment);
}

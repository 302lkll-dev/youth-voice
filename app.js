const SUPABASE_URL = 'https://hpxbybfwgchdrkxoqwph.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhweGJ5YmZ3Z2NoZHJreG9xd3BoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0NTA0MDksImV4cCI6MjA4ODAyNjQwOX0.pA_Ssa5kedLbS1pDDsEkIBkmKrIJ6h0-D4iDT8jKq6w';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const submitBtn = document.getElementById('submitBtn');
const commentInput = document.getElementById('commentInput');
const pwInput = document.getElementById('pwInput');
const commentList = document.getElementById('commentList');
const scrollTopBtn = document.getElementById('scrollTopBtn');

let isAdmin = false;
let currentSort = 'created_at'; // 기본 정렬값

window.onload = async () => await fetchComments();

// 스크롤 감지 (위로 가기 버튼 표시)
window.onscroll = () => {
    if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
        scrollTopBtn.style.display = "flex";
    } else {
        scrollTopBtn.style.display = "none";
    }
};

// 정렬 변경 함수
function changeSort(sortType) {
    currentSort = sortType;
    document.getElementById('sortNew').className = sortType === 'created_at' ? 'text-point-red underline' : 'text-gray-400';
    document.getElementById('sortPopular').className = sortType === 'likes' ? 'text-point-red underline' : 'text-gray-400';
    fetchComments();
}

async function fetchComments() {
    const { data, error } = await _supabase
        .from('comments')
        .select('*')
        .order(currentSort, { ascending: false });
    if (!error && data) {
        commentList.innerHTML = ''; 
        data.forEach(item => renderComment(item));
    }
}

async function deleteComment(id, originalPw) {
    if (!isAdmin) {
        const userPw = prompt("비밀번호를 입력하세요.");
        if (userPw !== originalPw) return alert("비밀번호가 일치하지 않습니다.");
    }
    if (confirm("정말 삭제하시겠습니까?")) {
        const { error } = await _supabase.from('comments').delete().eq('id', id);
        if (!error) await fetchComments();
    }
}

// 좋아요/싫어요 업데이트 함수
async function updateReaction(id, field, currentValue) {
    const updateData = {};
    updateData[field] = (currentValue || 0) + 1;
    const { error } = await _supabase.from('comments').update(updateData).eq('id', id);
    if (!error) await fetchComments();
}

submitBtn.addEventListener('click', async () => {
    const text = commentInput.value;
    const pw = pwInput.value;
    if (!text.trim() || !pw.trim()) return alert("내용과 비밀번호를 모두 입력해주세요!");
    const { error } = await _supabase.from('comments').insert([{ content: text, likes: 0, dislikes: 0, password: pw }]);
    if (!error) {
        commentInput.value = ""; pwInput.value = "";
        await fetchComments();
    }
});

function renderComment(item) {
    const date = new Date(item.created_at).toLocaleString('ko-KR', { hour12: false }).slice(5, 16);
    const newComment = document.createElement('div');
    newComment.className = "bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-4 animate-fade-in";
    
    const deleteBtn = `<button onclick="deleteComment(${item.id}, '${item.password}')" class="text-gray-300 hover:text-red-500 text-[10px] transition-colors">삭제</button>`;

    newComment.innerHTML = `
        <div class="flex items-center justify-between mb-2">
            <span class="font-bold text-sm text-point-red">익명의 청년</span>
            <span class="text-[10px] text-gray-400">${date}</span>
        </div>
        <p class="text-gray-700 text-sm mb-4 leading-relaxed">${item.content}</p>
        <div class="flex justify-between items-end">
            ${deleteBtn}
            <div class="flex gap-2">
                <button onclick="updateReaction(${item.id}, 'likes', ${item.likes})" class="flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-full border hover:bg-red-50 transition-all shadow-sm">
                    <span>❤️</span> <span>${item.likes || 0}</span>
                </button>
                <button onclick="updateReaction(${item.id}, 'dislikes', ${item.dislikes})" class="flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-full border hover:bg-gray-100 transition-all shadow-sm">
                    <span>🤔</span> <span>${item.dislikes || 0}</span>
                </button>
            </div>
        </div>
    `;
    commentList.appendChild(newComment);
}

function toggleAdminMode() {
    const password = prompt("관리자 비밀번호를 입력하세요.");
    if (password === "eoqkrdl123") {
        isAdmin = !isAdmin;
        alert(isAdmin ? "관리자 모드 활성화" : "관리자 모드 해제");
        fetchComments();
    } else { alert("틀렸습니다."); }
}

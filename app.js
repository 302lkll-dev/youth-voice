const SUPABASE_URL = 'https://hpxbybfwgchdrkxoqwph.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhweGJ5YmZ3Z2NoZHJreG9xd3BoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0NTA0MDksImV4cCI6MjA4ODAyNjQwOX0.pA_Ssa5kedLbS1pDDsEkIBkmKrIJ6h0-D4iDT8jKq6w';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const submitBtn = document.getElementById('submitBtn');
const commentInput = document.getElementById('commentInput');
const pwInput = document.getElementById('pwInput');
const commentList = document.getElementById('commentList');

let isAdmin = false;

window.onload = async () => await fetchComments();

function toggleAdminMode() {
    const password = prompt("관리자 비밀번호를 입력하세요.");
    if (password === "2028") {
        isAdmin = !isAdmin;
        alert(isAdmin ? "관리자 모드 활성화" : "관리자 모드 해제");
        fetchComments();
    } else { alert("틀렸습니다."); }
}

async function fetchComments() {
    const { data, error } = await _supabase.from('comments').select('*').order('created_at', { ascending: false });
    if (!error && data) {
        commentList.innerHTML = ''; 
        data.forEach(item => renderComment(item));
    }
}

// 삭제 함수 (관리자거나 비번이 맞거나)
async function deleteComment(id, originalPw) {
    if (!isAdmin) {
        const userPw = prompt("비밀번호를 입력하세요.");
        if (userPw !== originalPw) {
            alert("비밀번호가 일치하지 않습니다.");
            return;
        }
    }
    
    if (confirm("정말 삭제하시겠습니까?")) {
        const { error } = await _supabase.from('comments').delete().eq('id', id);
        if (!error) await fetchComments();
    }
}

async function addLike(id, currentLikes) {
    const { error } = await _supabase.from('comments').update({ likes: (currentLikes || 0) + 1 }).eq('id', id);
    if (!error) await fetchComments();
}

submitBtn.addEventListener('click', async () => {
    const text = commentInput.value;
    const pw = pwInput.value;
    if (!text.trim() || !pw.trim()) return alert("내용과 비밀번호를 모두 입력해주세요!");

    const { error } = await _supabase.from('comments').insert([{ content: text, likes: 0, password: pw }]);
    if (!error) {
        commentInput.value = "";
        pwInput.value = "";
        await fetchComments();
    }
});

function renderComment(item) {
    const date = new Date(item.created_at).toLocaleString('ko-KR', { hour12: false }).slice(5, 16);
    const newComment = document.createElement('div');
    newComment.className = "bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-4 animate-fade-in";
    
    newComment.innerHTML = `
        <div class="flex items-center justify-between mb-2">
            <span class="font-bold text-sm text-point-red">익명의 청년</span>
            <span class="text-[10px] text-gray-400">${date}</span>
        </div>
        <p class="text-gray-700 text-sm mb-3">${item.content}</p>
        <div class="flex justify-between items-center">
            <button onclick="deleteComment(${item.id}, '${item.password}')" class="text-gray-300 hover:text-red-500 text-xs transition-colors">삭제</button>
            <button onclick="addLike(${item.id}, ${item.likes || 0})" 
                class="flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full border hover:bg-red-50 transition-all shadow-sm">
                <span>❤️</span> <span>${item.likes || 0}</span>
            </button>
        </div>
    `;
    commentList.appendChild(newComment);
}

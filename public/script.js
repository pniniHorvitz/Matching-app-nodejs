let allDonations = [];
let allDonors = [];
let allGroups = [];

document.addEventListener('DOMContentLoaded', init);

async function init() {
    console.log("Initializing app...");
    await loadAllData();
    
    const form = document.getElementById('donation-form');
    if (form) {
        form.addEventListener('submit', handleDonationSubmit);
    }
}

async function loadAllData() {
    try {
        console.log("Fetching data from server...");
        const [cRes, dRes, gRes, drRes] = await Promise.all([
            fetch('/api/campaign'),
            fetch('/api/donations'),
            fetch('/api/groups/groups'),
            fetch('/api/groups/donors')
        ]);

        // בדיקה שכל התשובות תקינות
        if (!cRes.ok || !dRes.ok || !gRes.ok || !drRes.ok) {
            throw new Error("One or more requests failed");
        }

        const campaign = await cRes.json();
        console.log("Type of donations:", Array.isArray(allDonations)); // צריך להיות true
console.log("Campaign target:", window.currentCampaignData?.target); // האם מופיע מספר?
        window.currentCampaignData = campaign;
        allDonations = await dRes.json();
        allGroups = await gRes.json();
        allDonors = await drRes.json();

        console.log("Data loaded successfully:", { campaign, allDonations, allGroups, allDonors });

        // קריאה לכל פונקציות הרינדור
        renderUI(campaign);
        renderDonations();  
        renderGroups();     
        renderSolicitors(); 
        
        // מילוי רשימת המתרימים בטופס
        updateSolicitorSelect();

    } catch (e) {
        console.error("שגיאה קריטית בטעינת הנתונים:", e);
        alert("חלה שגיאה בטעינת הנתונים מהשרת. וודאי שהשרת רץ.");
    }
    renderAdminDonors();
    renderAdminDonors();
}
// script.js

async function saveAdminChanges() {
    // שלב 1: בקשת קוד מהמנהל
    const adminCode = prompt("נא להזין קוד מנהל לאישור השינויים:");
    if (!adminCode) return;

    // שלב 2: איסוף הנתונים
    const updateData = {
        name: document.getElementById('admin-title').value,
        target: document.getElementById('admin-target').value,
        deadline: document.getElementById('admin-deadline').value
    };

    try {
        // שלב 3: שליחה לשרת (שולחים גם את הנתונים וגם את הקוד)
        const res = await fetch('/api/campaign/update', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                ...updateData, 
                role: 'admin', 
                password: adminCode // זה הקוד שהמנהל הקיש
            })
        });

        if (res.ok) {
            alert("פרטי הקמפיין עודכנו בהצלחה!");
            await loadAllData();
            toggleAdminPanel();
        } else {
            const err = await res.json();
            // דרישה 6: הצגת הודעת שגיאה מסבירה (למשל "קוד שגוי")
            alert("שגיאה: " + (err.detail || err.message));
        }
    } catch (e) {
        alert("תקלה בתקשורת עם השרת.");
    }
}

function updateSolicitorSelect() {
    // מילוי מתרימים
    const solSelect = document.getElementById('solicitor-id');
    if (solSelect) {
        solSelect.innerHTML = '<option value="">ללא מתרים (תרומה כללית)</option>' + 
            allDonors.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
    }

    // מילוי קבוצות (החלק החדש)
    const groupSelect = document.getElementById('group-id');
    if (groupSelect) {
        groupSelect.innerHTML = '<option value="">ללא קבוצה (כללי)</option>' + 
            allGroups.map(g => `<option value="${g.id}">${g.name}</option>`).join('');
    }
}

function renderUI(campaign) {
    // 1. בדיקה: האם המשתנים בכלל קיימים ברגע הרינדור?
    console.log("--- DEBUG RENDER ---");
    console.log("Campaign received:", campaign);
    console.log("All Donations array:", allDonations);

    // 2. חישוב סכום (הוספנו בדיקה לכל תרומה)
    const current = allDonations.reduce((sum, d) => {
        const amt = Number(d.amount) || 0;
        return sum + amt;
    }, 0);

    // 3. חישוב אחוזים (הוספנו הגנה מחילוק ב-0 או undefined)
    const target = campaign && campaign.target ? Number(campaign.target) : 0;
    const rawPercent = (current / target) * 100;
const percent = target > 0 ? rawPercent.toFixed(2) : 0;

    console.log("Results:", { current, target, percent });

    const elements = {
        'campaign-title': campaign?.name || "טוען...",
        'current-amount': current.toLocaleString() + " ₪",
        'target-amount': target.toLocaleString() + " ₪",
        'percent-complete': percent + "%",
        'donors-count': allDonations.length,
        'days-left': campaign?.daysLeft || 0,
        'deadline-text': campaign ? "תאריך אחרון: " + new Date(campaign.deadline).toLocaleDateString('he-IL') : ""
    };

    for (const [id, value] of Object.entries(elements)) {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    }

    const bar = document.getElementById('progress-bar');
    if (bar) bar.style.width = percent + "%";
}
function renderDonations() {
    const list = document.getElementById('donations-list');
    if (!list) return;

    if (allDonations.length === 0) {
        list.innerHTML = '<p class="text-slate-400 italic">טרם התקבלו תרומות...</p>';
        return;
    }

    list.innerHTML = allDonations.slice().reverse().map(don => {
        const solicitor = allDonors.find(d => d.id == don.solicitorId);
        const group = solicitor ? allGroups.find(g => g.id == solicitor.groupId) : null;
        
        return `
            <div class="bg-white p-4 rounded-xl shadow-sm border-r-4 border-blue-500">
                <div class="flex justify-between items-start">
                    <div>
                        <p class="font-bold text-slate-800">${don.donorName}</p>
                        <p class="text-xs text-blue-500">
                            ${solicitor ? 'דרך: ' + solicitor.name : 'תרומה ישירה'} 
                            ${group ? ' | קבוצה: ' + group.name : ''}
                        </p>
                    </div>
                    <span class="text-lg font-black text-blue-700">₪${Number(don.amount).toLocaleString()}</span>
                </div>
                ${don.message ? `<p class="text-sm text-slate-500 mt-2 italic">"${don.message}"</p>` : ''}
            </div>
        `;
    }).join('');
}

function renderGroups() {
    const list = document.getElementById('groups-list');
    if (!list || !allGroups || !allDonations) return;

    list.innerHTML = allGroups.map(group => {
        
        const groupTotal = allDonations.reduce((sum, don) => {
           
            const matchByDirectGroupId = String(don.groupId) === String(group.id);
            
            let matchBySolicitor = false;
            if (!matchByDirectGroupId && don.solicitorId) {
                const solicitor = allDonors.find(d => String(d.id) === String(don.solicitorId));
                matchBySolicitor = solicitor && String(solicitor.groupId) === String(group.id);
            }

            if (matchByDirectGroupId || matchBySolicitor) {
                return sum + (Number(don.amount) || 0);
            }
            return sum;
        }, 0);

        const target = Number(group.target) || 1;
        const percent = Math.min(100, Math.floor((groupTotal / target) * 100));

        return `
            <div class="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div class="flex justify-between text-sm mb-1 font-bold">
                    <span>${group.name}</span>
                    <span class="text-blue-600">₪${groupTotal.toLocaleString()}</span>
                </div>
                <div class="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div class="bg-blue-400 h-full" style="width: ${percent}%"></div>
                </div>
            </div>`;
    }).join('');
}
function renderSolicitors() {
    const list = document.getElementById('solicitors-list');
    if (!list) return;

    list.innerHTML = allDonors.map(donor => {
        const totalRaised = allDonations
            .filter(d => d.solicitorId == donor.id)
            .reduce((sum, d) => sum + Number(d.amount), 0);
        const percent = Math.min(100, Math.floor((totalRaised / donor.personalTarget) * 100));
        
        return `
            <div class="bg-white p-3 rounded-lg border border-slate-200 shadow-sm mb-3">
                <div class="flex justify-between items-center mb-2">
                    <div>
                        <span class="font-bold text-slate-800">${donor.name}</span>
                        <p class="text-[10px] text-slate-400">יעד: ₪${donor.personalTarget.toLocaleString()}</p>
                    </div>
                    <button onclick="updateDonorTarget(${donor.id})" 
                            class="bg-slate-100 hover:bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs border border-blue-200 transition-colors">
                        ✏️ עדכן יעד
                    </button>
                </div>
                <div class="flex justify-between text-[10px] mb-1">
                    <span class="text-slate-500">גוייס: ₪${totalRaised.toLocaleString()}</span>
                    <span class="font-bold">${percent}%</span>
                </div>
                <div class="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div class="bg-green-500 h-full" style="width: ${percent}%"></div>
                </div>
            </div>
        `;
    }).join('');
}
// --- פונקציות תפעוליות ---

async function handleDonationSubmit(e) {
    e.preventDefault();
    const data = {
        donorName: document.getElementById('donor-name').value,
        solicitorId: document.getElementById('solicitor-id').value || null,
        groupId: document.getElementById('group-id').value || null, // הוספת הקבוצה
        amount: document.getElementById('donation-amount').value,
        message: document.getElementById('donation-message').value
    };

    try {
        const res = await fetch('/api/donations', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });

        if(res.ok) {
            closeDonationModal();
            await loadAllData();
            alert("תודה על תרומתך!");
            document.getElementById('donation-form').reset();
        }
    } catch (e) {
        alert("שגיאה בשליחת התרומה.");
    }
}

function openDonationModal() { document.getElementById('donation-modal').classList.remove('hidden'); }
function closeDonationModal() { document.getElementById('donation-modal').classList.add('hidden'); }
function toggleAdminPanel() {
    const panel = document.getElementById('admin-panel');
    const isHidden = panel.classList.contains('hidden');
    
    if (isHidden) {

        if (window.currentCampaignData) {
            document.getElementById('admin-title').value = window.currentCampaignData.name;
            document.getElementById('admin-target').value = window.currentCampaignData.target;
            document.getElementById('admin-deadline').value = window.currentCampaignData.deadline;
        }
        panel.classList.remove('hidden');
    } else {
        panel.classList.add('hidden');
    }
}

window.onclick = function(event) {
    if (event.target.id === 'donation-modal') closeDonationModal();
    if (event.target.id === 'admin-panel') toggleAdminPanel();
}
function renderAdminDonors() {
    const adminList = document.getElementById('admin-donors-list');
    if (!adminList) return;

    adminList.innerHTML = allDonors.map(donor => `
        <div class="flex flex-col bg-slate-50 p-3 mb-2 rounded-lg border border-slate-200">
            <div class="flex justify-between items-center mb-2">
                <span class="font-bold text-sm">${donor.name}</span>
                <span class="text-xs text-slate-400">ID: ${donor.id}</span>
            </div>
            <div class="flex gap-2">
                <input type="number" id="target-${donor.id}" value="${donor.personalTarget}" 
                       class="w-full p-1 border rounded text-sm font-mono">
                <button onclick="updateTarget(${donor.id})" 
                        class="bg-blue-500 text-white px-3 py-1 rounded text-xs">עדכן</button>
            </div>
        </div>
    `).join('');
}

async function addNewDonor() {
    const adminCode = prompt("פעולה זו דורשת הרשאת מנהל. הזן קוד:");
    if (adminCode !== "1234") {
        alert("קוד מנהל שגוי!");
        return;
    }

    const name = document.getElementById('new-donor-name').value;
    const target = document.getElementById('new-donor-target').value;
    const secretCode = document.getElementById('new-donor-code').value;
    const groupId = prompt("בחר מספר קבוצה (1: משפחה, 2: חברים, 3:קהילה):", "1");

    if (!name || !target || !secretCode) {
        alert("נא למלא את כל השדות!");
        return;
    }

    const res = await fetch('/api/groups/add-donor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, target, secretCode, groupId, role: 'admin', password: adminCode })
    });

    if (res.ok) {
        alert("מתרים נוסף בהצלחה!");
        loadAllData();
        toggleAddDonorForm(); 
    }
}

function renderAdminDonors() {
    const adminList = document.getElementById('admin-donors-list');
    adminList.innerHTML = allDonors.map(donor => `
        <div class="flex justify-between items-center bg-white p-3 mb-2 rounded shadow-sm border border-slate-200">
            <div>
                <span class="font-bold">${donor.name}</span>
            </div>
            <div class="flex gap-2">
                <input type="number" id="target-${donor.id}" value="${donor.personalTarget}" 
                       class="w-24 p-1 border rounded text-sm font-mono">
                <button onclick="updateTarget(${donor.id})" class="bg-blue-500 text-white px-2 py-1 rounded text-xs">עדכן</button>
            </div>
        </div>
    `).join('');
}

async function updateTarget(donorId) {
    const adminCode = prompt("הזן קוד מנהל (1234):");
    if (!adminCode) return;

    const newTarget = document.getElementById(`target-${donorId}`).value;

    try {
        
        const res = await fetch(`/api/groups/donors/${donorId}/target`, { 
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                target: Number(newTarget), 
                secretCode: adminCode 
            })
        });

        if (res.ok) {
            alert("עודכן בהצלחה!");
            await loadAllData();
        } else {
            const data = await res.json();
            alert("שגיאה: " + data.message);
        }
    } catch (e) {
        alert("אופס! חלה שגיאה בשרת המאצ'ינג"); 
    }
}
async function updateDonorTarget(donorId) {
    const secretCode = prompt("נא להזין קוד אישי (או קוד מנהל):");
    if (!secretCode) return;

    const newTarget = prompt("הזן יעד חדש:");
    if (!newTarget || isNaN(newTarget)) return;

    try {
        const res = await fetch(`/api/groups/donors/${donorId}/target`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                target: newTarget,
                secretCode: secretCode 
            })
        });

        const data = await res.json();

        if (res.ok) {
            alert("היעד עודכן בהצלחה!");
            location.reload(); 
        } else {
            alert("שגיאה: " + data.message);
        }
    } catch (e) {
        alert("תקלה בחיבור לשרת");
    }
}

function showAdminSection(section) {
    if (section === 'campaign') {
        document.getElementById('section-campaign').classList.remove('hidden');
        document.getElementById('section-donors').classList.add('hidden');
    } else {
        document.getElementById('section-campaign').classList.add('hidden');
        document.getElementById('section-donors').classList.remove('hidden');
        renderAdminDonors(); 
    }
}


function toggleAddDonorForm() {
    const form = document.getElementById('add-donor-form');
    form.classList.toggle('hidden');
}

function showAdminSection(section, btn) {
  
    document.getElementById('section-campaign').classList.add('hidden');
    document.getElementById('section-donors').classList.add('hidden');
    
  
    document.querySelectorAll('.admin-nav-btn').forEach(b => b.classList.remove('active', 'bg-blue-600', 'text-white'));

 
    document.getElementById(`section-${section}`).classList.remove('hidden');
    

    if (btn) {
        btn.classList.add('active', 'bg-blue-600', 'text-white');
    }

    if (section === 'donors') renderAdminDonors();
}